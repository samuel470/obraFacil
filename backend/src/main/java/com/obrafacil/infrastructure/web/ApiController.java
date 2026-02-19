package com.obrafacil.infrastructure.web;

import com.obrafacil.application.dto.AuthDtos.*;
import com.obrafacil.application.dto.ProjectDtos.*;
import com.obrafacil.application.service.CoreService;
import com.obrafacil.infrastructure.ai.GeminiService;
import com.obrafacil.infrastructure.persistence.*;
import com.obrafacil.infrastructure.security.AuthUser;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping
public class ApiController {
  private final CoreService core; private final GeminiService gemini; private final SimpMessagingTemplate ws;
  private final StageRepository stageRepo; private final ChecklistRepository checklistRepo; private final DiaryRepository diaryRepo; private final DiaryPhotoRepository photoRepo;
  private final NonConformityRepository rncRepo; private final PaymentRepository paymentRepo; private final DocumentRepository docRepo; private final MessageRepository msgRepo; private final NotificationRepository notifRepo;
  public ApiController(CoreService core, GeminiService gemini, SimpMessagingTemplate ws, StageRepository stageRepo, ChecklistRepository checklistRepo, DiaryRepository diaryRepo, DiaryPhotoRepository photoRepo, NonConformityRepository rncRepo, PaymentRepository paymentRepo, DocumentRepository docRepo, MessageRepository msgRepo, NotificationRepository notifRepo) {
    this.core = core; this.gemini = gemini; this.ws = ws; this.stageRepo = stageRepo; this.checklistRepo = checklistRepo; this.diaryRepo = diaryRepo; this.photoRepo = photoRepo; this.rncRepo = rncRepo; this.paymentRepo = paymentRepo; this.docRepo = docRepo; this.msgRepo = msgRepo; this.notifRepo = notifRepo;
  }
  private AuthUser me(HttpServletRequest req){ var me=(AuthUser)req.getAttribute("authUser"); if(me==null) throw new RuntimeException("Não autenticado"); return me; }

  @PostMapping("/auth/register") public TokenResponse register(@Valid @RequestBody RegisterRequest req){ return core.register(req); }
  @PostMapping("/auth/login") public TokenResponse login(@Valid @RequestBody LoginRequest req){ return core.login(req); }
  @PostMapping("/auth/refresh") public TokenResponse refresh(@Valid @RequestBody RefreshRequest req){ return core.refresh(req.refreshToken()); }
  @PostMapping("/auth/logout") @ResponseStatus(HttpStatus.NO_CONTENT) public void logout(@Valid @RequestBody RefreshRequest req){ core.logout(req.refreshToken()); }

  @GetMapping("/me") public AuthUser meGet(HttpServletRequest req){ return me(req); }

  @GetMapping("/projects") public List<Project> projects(HttpServletRequest req){ return core.projects(me(req)); }
  @PostMapping("/projects") public Project createProject(HttpServletRequest req,@Valid @RequestBody ProjectRequest r){ return core.createProject(me(req),r); }
  @GetMapping("/projects/{id}") public Project project(HttpServletRequest req,@PathVariable UUID id){ return core.project(me(req),id); }

  @GetMapping("/projects/{id}/stages") public List<Stage> stages(HttpServletRequest req,@PathVariable UUID id){ core.project(me(req),id); return stageRepo.findByProjectIdOrderByOrdem(id); }
  @PostMapping("/projects/{id}/stages") public Stage createStage(HttpServletRequest req,@PathVariable UUID id,@Valid @RequestBody StageRequest s){ return core.createStage(me(req),id,s); }
  @PatchMapping("/projects/{id}/stages/{stageId}/checklist/{itemId}") public ChecklistItem toggle(HttpServletRequest req,@PathVariable UUID id,@PathVariable UUID stageId,@PathVariable UUID itemId,@Valid @RequestBody ChecklistToggleRequest b){ return core.toggleChecklist(me(req),id,stageId,itemId,b.concluido()); }

  @GetMapping("/projects/{id}/diaries") public List<Diary> diaries(HttpServletRequest req,@PathVariable UUID id){ core.project(me(req),id); return diaryRepo.findTop10ByProjectIdOrderByCreatedAtDesc(id); }
  @PostMapping("/projects/{id}/diaries") public Diary createDiary(HttpServletRequest req,@PathVariable UUID id,@Valid @RequestBody DiaryRequest d){ return core.createDiary(me(req),id,d); }
  @PostMapping("/projects/{id}/diaries/{diaryId}/photos") public DiaryPhoto addPhoto(HttpServletRequest req,@PathVariable UUID id,@PathVariable UUID diaryId,@Valid @RequestBody PhotoRequest p){ core.project(me(req),id); DiaryPhoto x=new DiaryPhoto(); x.id=UUID.randomUUID();x.diarioId=diaryId;x.url=p.url();x.categoria=p.categoria();x.createdAt=java.time.Instant.now(); return photoRepo.save(x); }

  @GetMapping("/projects/{id}/nonconformities") public List<NonConformity> rnc(HttpServletRequest req,@PathVariable UUID id){ core.project(me(req),id); return rncRepo.findByProjectId(id); }
  @PostMapping("/projects/{id}/nonconformities") public NonConformity rncCreate(HttpServletRequest req,@PathVariable UUID id,@Valid @RequestBody RncRequest r){ core.project(me(req),id); NonConformity n=new NonConformity(); n.id=UUID.randomUUID(); n.projectId=id; n.titulo=r.titulo(); n.descricao=r.descricao(); n.status=com.obrafacil.domain.enums.RncStatus.ABERTO; n.gravidade=r.gravidade(); n.data=r.data(); return rncRepo.save(n); }

  @GetMapping("/projects/{id}/payments") public List<Payment> payments(HttpServletRequest req,@PathVariable UUID id){ core.project(me(req),id); return paymentRepo.findByProjectId(id); }
  @PostMapping("/projects/{id}/payments") public Payment payCreate(HttpServletRequest req,@PathVariable UUID id,@Valid @RequestBody PaymentRequest p){ core.project(me(req),id); Payment x=new Payment(); x.id=UUID.randomUUID();x.projectId=id;x.descricao=p.descricao();x.categoria=p.categoria();x.valor=p.valor();x.dataVencimento=p.dataVencimento();x.status=p.status(); return paymentRepo.save(x); }

  @GetMapping("/projects/{id}/documents") public List<Document> docs(HttpServletRequest req,@PathVariable UUID id){ core.project(me(req),id); return docRepo.findByProjectId(id); }
  @PostMapping("/projects/{id}/documents") public Document docCreate(HttpServletRequest req,@PathVariable UUID id,@Valid @RequestBody DocumentRequest d){ core.project(me(req),id); Document x=new Document(); x.id=UUID.randomUUID();x.projectId=id;x.nome=d.nome();x.tipo=d.tipo();x.url=d.url();x.data=d.data(); return docRepo.save(x); }

  @GetMapping("/projects/{id}/messages") public List<Message> msgs(HttpServletRequest req,@PathVariable UUID id){ core.project(me(req),id); return msgRepo.findByProjectIdOrderByTimestampAsc(id); }
  @PostMapping("/projects/{id}/messages") public Message msgCreate(HttpServletRequest req,@PathVariable UUID id,@Valid @RequestBody MessageRequest m){ var message=core.postMessage(me(req),id,m); ws.convertAndSend("/topic/chat."+id,message); return message; }

  @PostMapping("/projects/{id}/executive-summary") public Map<String,String> ai(HttpServletRequest req,@PathVariable UUID id){ core.project(me(req),id); core.canUseAiAndConsume(me(req)); return Map.of("summary", gemini.executiveSummary(id)); }

  @GetMapping("/notifications") public List<Notification> notifications(HttpServletRequest req){ return notifRepo.findByUserIdOrderByDataDesc(me(req).id()); }
  @PatchMapping("/notifications/{id}/read") public Notification read(HttpServletRequest req,@PathVariable UUID id){ var n=notifRepo.findById(id).orElseThrow(); if(!n.userId.equals(me(req).id())) throw new RuntimeException("Sem acesso"); n.lido=true; return notifRepo.save(n); }

  @PatchMapping("/me") public Map<String,String> patchMe(HttpServletRequest req,@RequestBody Map<String,String> body){ return Map.of("status","ok"); }
  @PatchMapping("/projects/{id}") public Project patchProject(HttpServletRequest req,@PathVariable UUID id,@RequestBody Map<String,Object> body){ var p=core.project(me(req),id); if(body.containsKey("nome")) p.nome=Objects.toString(body.get("nome")); return p; }
  @PatchMapping("/projects/{id}/stages/{stageId}") public Stage patchStage(HttpServletRequest req,@PathVariable UUID id,@PathVariable UUID stageId,@RequestBody Map<String,Object> body){ core.project(me(req),id); var s=stageRepo.findById(stageId).orElseThrow(); if(body.containsKey("nome")) s.nome=Objects.toString(body.get("nome")); return stageRepo.save(s); }
  @PatchMapping("/projects/{id}/nonconformities/{rncId}") public NonConformity patchRnc(HttpServletRequest req,@PathVariable UUID id,@PathVariable UUID rncId,@RequestBody Map<String,Object> body){ core.project(me(req),id); var r=rncRepo.findById(rncId).orElseThrow(); if(body.containsKey("status")) r.status=com.obrafacil.domain.enums.RncStatus.valueOf(Objects.toString(body.get("status"))); return rncRepo.save(r); }
  @PatchMapping("/projects/{id}/payments/{paymentId}") public Payment patchPayment(HttpServletRequest req,@PathVariable UUID id,@PathVariable UUID paymentId,@RequestBody Map<String,Object> body){ core.project(me(req),id); var p=paymentRepo.findById(paymentId).orElseThrow(); if(body.containsKey("status")) p.status=com.obrafacil.domain.enums.PaymentStatus.valueOf(Objects.toString(body.get("status"))); return paymentRepo.save(p); }

}
