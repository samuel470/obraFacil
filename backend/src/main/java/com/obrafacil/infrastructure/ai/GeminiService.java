package com.obrafacil.infrastructure.ai;

import com.obrafacil.infrastructure.persistence.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class GeminiService {
  private final DiaryRepository diaries; private final StageRepository stages; private final NonConformityRepository rncs; private final PaymentRepository payments;
  @Value("${app.gemini.key:}") String geminiKey;
  public GeminiService(DiaryRepository diaries, StageRepository stages, NonConformityRepository rncs, PaymentRepository payments) {
    this.diaries = diaries; this.stages = stages; this.rncs = rncs; this.payments = payments;
  }
  public String executiveSummary(UUID projectId){
    String prompt="Gere um resumo executivo formal em PT-BR para cliente final. Inclua progresso de etapas, destaques dos diários, riscos de RNC, próximos passos e status financeiro. Dados:"+
      " etapas="+stages.findByProjectIdOrderByOrdem(projectId).size()+
      " diarios="+diaries.findTop10ByProjectIdOrderByCreatedAtDesc(projectId).stream().map(d->d.descricao).toList()+
      " rncAbertas="+rncs.countByProjectIdAndStatus(projectId, com.obrafacil.domain.enums.RncStatus.ABERTO)+
      " pagamentos="+payments.findByProjectId(projectId).size();
    if(geminiKey==null || geminiKey.isBlank()) return "Resumo indisponível no momento. Dados coletados e prontos para IA.";
    try {
      String url="https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key="+geminiKey;
      Map<String,Object> body=Map.of("contents", List.of(Map.of("parts", List.of(Map.of("text", prompt)))));
      var headers=new HttpHeaders(); headers.setContentType(MediaType.APPLICATION_JSON);
      ResponseEntity<Map> resp = new RestTemplate().postForEntity(url,new HttpEntity<>(body,headers),Map.class);
      return Objects.toString(resp.getBody(), "Resumo gerado.");
    } catch (Exception e){
      return "Resumo temporariamente indisponível. Tente novamente em instantes.";
    }
  }
}
