package com.obrafacil.application.service;

import com.obrafacil.application.dto.AuthDtos.*;
import com.obrafacil.application.dto.ProjectDtos.*;
import com.obrafacil.domain.enums.*;
import com.obrafacil.infrastructure.persistence.*;
import com.obrafacil.infrastructure.security.*;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@Transactional
public class CoreService {
  private final UsuarioRepository users; private final RefreshTokenRepository refreshRepo; private final ProjectRepository projects;
  private final StageRepository stages; private final ChecklistRepository checklists; private final DiaryRepository diaries; private final DiaryPhotoRepository photos;
  private final NonConformityRepository rncs; private final PaymentRepository payments; private final DocumentRepository docs;
  private final MessageRepository messages; private final NotificationRepository notifications; private final AiUsageRepository aiUsageRepository;
  private final JwtService jwt; private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
  public CoreService(UsuarioRepository users, RefreshTokenRepository refreshRepo, ProjectRepository projects, StageRepository stages, ChecklistRepository checklists, DiaryRepository diaries, DiaryPhotoRepository photos, NonConformityRepository rncs, PaymentRepository payments, DocumentRepository docs, MessageRepository messages, NotificationRepository notifications, AiUsageRepository aiUsageRepository, JwtService jwt) {
    this.users = users; this.refreshRepo = refreshRepo; this.projects = projects; this.stages = stages; this.checklists = checklists; this.diaries = diaries; this.photos = photos; this.rncs = rncs; this.payments = payments; this.docs = docs; this.messages = messages; this.notifications = notifications; this.aiUsageRepository = aiUsageRepository; this.jwt = jwt;
  }

  public TokenResponse register(RegisterRequest req){
    users.findByEmail(req.email()).ifPresent(u->{ throw new ResponseStatusException(HttpStatus.CONFLICT,"E-mail ja existe");});
    Usuario u=new Usuario(); u.id=UUID.randomUUID(); u.nome=req.nome(); u.email=req.email(); u.senhaHash=encoder.encode(req.senha()); u.role=req.role(); u.plan=req.plan(); u.createdAt=Instant.now(); users.save(u);
    return login(new LoginRequest(req.email(), req.senha()));
  }
  public TokenResponse login(LoginRequest req){
    Usuario u=users.findByEmail(req.email()).orElseThrow(()->new ResponseStatusException(HttpStatus.UNAUTHORIZED,"Credenciais invalidas"));
    if(!encoder.matches(req.senha(), u.senhaHash)) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,"Credenciais invalidas");
    String access=jwt.generateAccess(u.id,u.role); String refresh=jwt.generateRefresh(u.id);
    RefreshToken t=new RefreshToken(); t.id=UUID.randomUUID(); t.userId=u.id; t.token=refresh; t.expiresAt=Instant.now().plus(Duration.ofDays(30)); t.revoked=false; refreshRepo.save(t);
    return new TokenResponse(access,refresh);
  }
  public TokenResponse refresh(String token){
    RefreshToken t=refreshRepo.findByToken(token).orElseThrow(()->new ResponseStatusException(HttpStatus.UNAUTHORIZED,"Refresh invalido"));
    if(Boolean.TRUE.equals(t.revoked) || t.expiresAt.isBefore(Instant.now())) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,"Refresh expirado");
    Usuario u=users.findById(t.userId).orElseThrow(); return new TokenResponse(jwt.generateAccess(u.id,u.role),token);
  }
  public void logout(String token){ refreshRepo.findByToken(token).ifPresent(t->t.revoked=true); }

  public Usuario me(AuthUser authUser){ return users.findById(authUser.id()).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Usuario nao encontrado")); }

  public Usuario updateProfile(AuthUser authUser, ProfileUpdateRequest req){
    Usuario u=users.findById(authUser.id()).orElseThrow();
    if(req.nome()!=null && !req.nome().isBlank()) u.nome=req.nome();
    if(req.avatarUrl()!=null) u.avatarUrl=req.avatarUrl();
    return users.save(u);
  }

  public List<Project> projects(AuthUser me){ return me.role()==Role.CLIENTE?projects.findByClientId(me.id()):projects.findByResponsibleId(me.id()); }
  public Project createProject(AuthUser me, ProjectRequest req){
    if(me.role()!=Role.RESPONSAVEL) throw new ResponseStatusException(HttpStatus.FORBIDDEN,"Apenas responsavel cria projetos");
    long active=projects.countByResponsibleIdAndStatusNot(me.id(), ProjectStatus.CONCLUIDO);
    if(me.plan()==Plan.BASICO && active>=1) throw new ResponseStatusException(HttpStatus.PAYMENT_REQUIRED,"Plano Basico permite 1 obra ativa");
    if(me.plan()==Plan.PROFISSIONAL && active>=5) throw new ResponseStatusException(HttpStatus.PAYMENT_REQUIRED,"Plano Profissional permite 5 obras ativas");
    Project p=new Project(); p.id=UUID.randomUUID(); p.nome=req.nome(); p.endereco=req.endereco(); p.clientId=req.clientId(); p.responsibleId=me.id(); p.status=ProjectStatus.PLANEJAMENTO; p.progresso=0; p.orcamentoTotal=req.orcamentoTotal(); p.criadoEm=Instant.now(); return projects.save(p);
  }
  public Project project(AuthUser me, UUID id){ Project p=projects.findById(id).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Projeto nao encontrado")); authorizeProject(me,p); return p; }

  public Map<String,Object> dashboardStats(AuthUser me){
    var projectList=projects(me);
    long total=projectList.size();
    long emAndamento=projectList.stream().filter(p->p.status==ProjectStatus.EM_ANDAMENTO).count();
    long concluido=projectList.stream().filter(p->p.status==ProjectStatus.CONCLUIDO).count();
    long planejamento=projectList.stream().filter(p->p.status==ProjectStatus.PLANEJAMENTO).count();
    BigDecimal orcamentoTotal=projectList.stream().map(p->p.orcamentoTotal==null?BigDecimal.ZERO:p.orcamentoTotal).reduce(BigDecimal.ZERO,BigDecimal::add);
    var ids=projectList.stream().map(p->p.id).toList();
    long rncAbertas=ids.stream().mapToLong(id->rncs.countByProjectIdAndStatus(id,RncStatus.ABERTO)).sum();
    LocalDate now=LocalDate.now(); LocalDate nextWeek=now.plusDays(7);
    long pagamentosVencendo=ids.stream().flatMap(id->payments.findByProjectId(id).stream())
      .filter(p->p.status==PaymentStatus.PENDENTE&&p.dataVencimento!=null&&!p.dataVencimento.isBefore(now)&&!p.dataVencimento.isAfter(nextWeek)).count();
    return Map.of("total",total,"emAndamento",emAndamento,"concluido",concluido,"planejamento",planejamento,"orcamentoTotal",orcamentoTotal,"rncAbertas",rncAbertas,"pagamentosVencendo",pagamentosVencendo);
  }

  public Stage createStage(AuthUser me, UUID pid, StageRequest req){ Project p=project(me,pid); if(me.role()!=Role.RESPONSAVEL) throw new ResponseStatusException(HttpStatus.FORBIDDEN,"Somente responsavel"); Stage s=new Stage(); s.id=UUID.randomUUID(); s.projectId=p.id; s.nome=req.nome(); s.ordem=req.ordem(); s.progresso=0; s.concluido=false; return stages.save(s); }
  public ChecklistItem toggleChecklist(AuthUser me, UUID pid, UUID stageId, UUID itemId, boolean concluido){ project(me,pid); if(me.role()!=Role.RESPONSAVEL) throw new ResponseStatusException(HttpStatus.FORBIDDEN,"Somente responsavel"); ChecklistItem i=checklists.findById(itemId).orElseThrow(); i.concluido=concluido; recalcStage(stageId); recalcProject(pid); return i; }

  public ChecklistItem addChecklistItem(AuthUser me, UUID pid, UUID stageId, ChecklistItemRequest req){
    project(me,pid); if(me.role()!=Role.RESPONSAVEL) throw new ResponseStatusException(HttpStatus.FORBIDDEN,"Somente responsavel");
    ChecklistItem item=new ChecklistItem(); item.id=UUID.randomUUID(); item.etapaId=stageId; item.rotulo=req.rotulo(); item.concluido=false;
    var saved=checklists.save(item); recalcStage(stageId); recalcProject(pid); return saved;
  }

  public void deleteChecklistItem(AuthUser me, UUID pid, UUID stageId, UUID itemId){
    project(me,pid); if(me.role()!=Role.RESPONSAVEL) throw new ResponseStatusException(HttpStatus.FORBIDDEN,"Somente responsavel");
    checklists.deleteById(itemId); recalcStage(stageId); recalcProject(pid);
  }

  private void recalcStage(UUID stageId){
    var items=checklists.findByEtapaId(stageId); Stage s=stages.findById(stageId).orElseThrow();
    if(items.isEmpty()){ s.progresso=0; s.concluido=false; stages.save(s); return; }
    long ok=items.stream().filter(it->Boolean.TRUE.equals(it.concluido)).count(); int prog=(int)Math.round((ok*100.0)/items.size()); s.progresso=prog; s.concluido=prog==100;
    stages.save(s);
  }
  private void recalcProject(UUID pid){
    var ss=stages.findByProjectIdOrderByOrdem(pid); Project p=projects.findById(pid).orElseThrow();
    p.progresso=ss.isEmpty()?0:(int)Math.round(ss.stream().mapToInt(st->st.progresso==null?0:st.progresso).average().orElse(0));
    if(p.progresso==100) p.status=ProjectStatus.CONCLUIDO;
    else if(p.progresso>0) p.status=ProjectStatus.EM_ANDAMENTO;
    projects.save(p);
  }

  public Diary createDiary(AuthUser me, UUID pid, DiaryRequest req){ project(me,pid); if(req.idempotencyKey()!=null){ var e=diaries.findByIdempotencyKey(req.idempotencyKey()); if(e.isPresent()) return e.get(); }
    Diary d=new Diary(); d.id=UUID.randomUUID(); d.projectId=pid; d.data=req.data(); d.descricao=req.descricao(); d.clima=req.clima(); d.ocorrencias=req.ocorrencias(); d.createdAt=Instant.now(); d.idempotencyKey=req.idempotencyKey(); return diaries.save(d);
  }
  public Message postMessage(AuthUser me, UUID pid, MessageRequest req){ project(me,pid); if(req.idempotencyKey()!=null){ var e=messages.findByIdempotencyKey(req.idempotencyKey()); if(e.isPresent()) return e.get(); }
    Message m=new Message(); m.id=UUID.randomUUID(); m.projectId=pid; m.senderId=me.id(); m.text=req.text(); m.timestamp=Instant.now(); m.isDecision=Boolean.TRUE.equals(req.isDecision()); m.idempotencyKey=req.idempotencyKey(); return messages.save(m);
  }

  public String canUseAiAndConsume(AuthUser me){
    String ref=YearMonth.now().format(DateTimeFormatter.ofPattern("yyyy-MM")); AiUsage usage=aiUsageRepository.findByUserIdAndMonthRef(me.id(),ref).orElseGet(()->{AiUsage x=new AiUsage();x.id=UUID.randomUUID();x.userId=me.id();x.monthRef=ref;x.usedCount=0;return x;});
    int limit= me.plan()==Plan.BASICO?3: me.plan()==Plan.PROFISSIONAL?30: Integer.MAX_VALUE;
    if(usage.usedCount>=limit) throw new ResponseStatusException(HttpStatus.PAYMENT_REQUIRED,"Limite de IA do plano atingido ("+limit+"/mes)");
    usage.usedCount += 1; aiUsageRepository.save(usage); return ref;
  }

  private void authorizeProject(AuthUser me, Project p){
    boolean ok= me.role()==Role.RESPONSAVEL? p.responsibleId.equals(me.id()) : p.clientId.equals(me.id());
    if(!ok) throw new ResponseStatusException(HttpStatus.FORBIDDEN,"Sem acesso ao projeto");
  }
}
