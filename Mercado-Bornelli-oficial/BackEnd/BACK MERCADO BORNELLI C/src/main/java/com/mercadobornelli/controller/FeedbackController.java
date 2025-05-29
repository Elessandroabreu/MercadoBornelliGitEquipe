package com.mercadobornelli.controller;

import com.mercadobornelli.dto.FeedbackDTO;
import com.mercadobornelli.model.Feedback;
import com.mercadobornelli.service.FeedbackService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/feedbacks")
@CrossOrigin(origins = "*", maxAge = 3600)
public class FeedbackController {

    @Autowired
    private FeedbackService feedbackService;

    @GetMapping
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<List<FeedbackDTO>> listarTodos() {
        List<FeedbackDTO> feedbacks = feedbackService.listarTodos();
        return ResponseEntity.ok(feedbacks);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<FeedbackDTO> buscarPorId(@PathVariable Long id) {
        FeedbackDTO feedback = feedbackService.buscarPorId(id);
        return ResponseEntity.ok(feedback);
    }

    @GetMapping("/venda/{idVenda}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<FeedbackDTO> buscarPorVenda(@PathVariable Long idVenda) {
        FeedbackDTO feedback = feedbackService.buscarPorVenda(idVenda);
        return ResponseEntity.ok(feedback);
    }

    @GetMapping("/cliente/{idCliente}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<List<FeedbackDTO>> buscarPorCliente(@PathVariable Long idCliente) {
        List<FeedbackDTO> feedbacks = feedbackService.buscarPorCliente(idCliente);
        return ResponseEntity.ok(feedbacks);
    }

    @GetMapping("/tipo/{tipo}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<List<FeedbackDTO>> buscarPorTipo(@PathVariable Feedback.TipoFeedback tipo) {
        List<FeedbackDTO> feedbacks = feedbackService.buscarPorTipo(tipo);
        return ResponseEntity.ok(feedbacks);
    }

    @GetMapping("/periodo")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<List<FeedbackDTO>> buscarPorPeriodo(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fim) {
        List<FeedbackDTO> feedbacks = feedbackService.buscarPorPeriodo(inicio, fim);
        return ResponseEntity.ok(feedbacks);
    }

    @PostMapping
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<FeedbackDTO> salvar(@Valid @RequestBody FeedbackDTO feedbackDTO) {
        FeedbackDTO novoFeedback = feedbackService.salvar(feedbackDTO);
        return ResponseEntity.ok(novoFeedback);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        feedbackService.excluir(id);
        return ResponseEntity.noContent().build();
    }

    // 🔧 CORRIGIDO: Método único para média de avaliações com filtro opcional
    @GetMapping("/media-avaliacoes")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<Double> calcularMediaAvaliacoes(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime inicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fim) {
        try {
            Double media;

            if (inicio != null && fim != null) {
                // Filtrar por período
                media = feedbackService.calcularMediaAvaliacoesPorPeriodo(inicio, fim);
            } else {
                // Sem filtro (comportamento original)
                media = feedbackService.calcularMediaAvaliacoes();
            }

            return ResponseEntity.ok(media != null ? media : 0.0);
        } catch (Exception e) {
            System.err.println("Erro ao calcular média de avaliações: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(0.0);
        }
    }

    @GetMapping("/relatorio")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> gerarRelatorio(
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss") LocalDateTime inicio,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss") LocalDateTime fim) {

        // 🔍 DEBUG: Log das datas recebidas no controller
        System.out.println("=== CONTROLLER - DATAS RECEBIDAS ===");
        System.out.println("Início (Controller): " + inicio);
        System.out.println("Fim (Controller): " + fim);
        System.out.println("==================================");

        Map<String, Object> relatorio = feedbackService.gerarRelatorio(inicio, fim);
        return ResponseEntity.ok(relatorio);
    }
}