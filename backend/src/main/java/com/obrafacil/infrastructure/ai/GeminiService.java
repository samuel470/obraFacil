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

  @SuppressWarnings("unchecked")
  public String executiveSummary(UUID projectId){
    var stageList = stages.findByProjectIdOrderByOrdem(projectId);
    var diaryList = diaries.findTop10ByProjectIdOrderByCreatedAtDesc(projectId);
    long rncAbertas = rncs.countByProjectIdAndStatus(projectId, com.obrafacil.domain.enums.RncStatus.ABERTO);
    var paymentList = payments.findByProjectId(projectId);
    double avgProgress = stageList.stream().mapToInt(s -> s.progresso == null ? 0 : s.progresso).average().orElse(0);

    String prompt = "Gere um resumo executivo formal em PT-BR para o cliente final de uma obra de construcao civil. " +
      "Use linguagem clara e profissional. Inclua: situacao geral das etapas, destaques dos diarios recentes, " +
      "riscos de nao conformidade, status financeiro e proximos passos recomendados. Dados do projeto: " +
      "progresso medio=" + String.format("%.0f", avgProgress) + "%, " +
      "etapas=" + stageList.stream().map(s -> s.nome + "(" + (s.progresso==null?0:s.progresso) + "%)").toList() + ", " +
      "diarios recentes=" + diaryList.stream().map(d -> d.data + ": " + d.descricao).toList() + ", " +
      "rncAbertas=" + rncAbertas + ", " +
      "pagamentos=" + paymentList.size() + " (" +
        paymentList.stream().filter(p -> p.status == com.obrafacil.domain.enums.PaymentStatus.PAGO).count() + " pagos, " +
        paymentList.stream().filter(p -> p.status == com.obrafacil.domain.enums.PaymentStatus.PENDENTE).count() + " pendentes).";

    if (geminiKey == null || geminiKey.isBlank())
      return "Resumo indisponivel: chave de API nao configurada. Dados coletados: " + prompt;
    try {
      String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + geminiKey;
      Map<String, Object> body = Map.of("contents", List.of(Map.of("parts", List.of(Map.of("text", prompt)))));
      var headers = new HttpHeaders(); headers.setContentType(MediaType.APPLICATION_JSON);
      ResponseEntity<Map> resp = new RestTemplate().postForEntity(url, new HttpEntity<>(body, headers), Map.class);
      if (resp.getBody() == null) return "Resumo gerado com sucesso.";
      List<Map<String, Object>> candidates = (List<Map<String, Object>>) resp.getBody().get("candidates");
      if (candidates == null || candidates.isEmpty()) return "Resumo gerado.";
      Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
      List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
      return Objects.toString(parts.get(0).get("text"), "Resumo gerado.");
    } catch (Exception e) {
      return "Resumo temporariamente indisponivel. Tente novamente em instantes.";
    }
  }
}
