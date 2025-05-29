package com.mercadobornelli.service;

import com.mercadobornelli.dto.FeedbackDTO;
import com.mercadobornelli.exception.ResourceNotFoundException;
import com.mercadobornelli.model.Cliente;
import com.mercadobornelli.model.Feedback;
import com.mercadobornelli.model.Venda;
import com.mercadobornelli.repository.ClienteRepository;
import com.mercadobornelli.repository.FeedbackRepository;
import com.mercadobornelli.repository.VendaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class FeedbackService {

    @Autowired
    private FeedbackRepository feedbackRepository;

    @Autowired
    private VendaRepository vendaRepository;

    @Autowired
    private ClienteRepository clienteRepository;

    @Transactional(readOnly = true)
    public List<FeedbackDTO> listarTodos() {

        try {
            return feedbackRepository.findAllWithClienteAndVenda().stream()
                    .map(this::converterParaDTO)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            // Fallback para o método padrão se o método customizado não existir
            return feedbackRepository.findAll().stream()
                    .map(this::converterParaDTO)
                    .collect(Collectors.toList());
        }
    }

    @Transactional(readOnly = true)
    public FeedbackDTO buscarPorId(Long id) {
        Feedback feedback = feedbackRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Feedback não encontrado com o id: " + id));

        return converterParaDTO(feedback);
    }

    @Transactional(readOnly = true)
    public FeedbackDTO buscarPorVenda(Long idVenda) {
        Feedback feedback = feedbackRepository.findByVendaIdVenda(idVenda)
                .orElseThrow(() -> new ResourceNotFoundException("Feedback não encontrado para a venda com id: " + idVenda));

        return converterParaDTO(feedback);
    }

    @Transactional(readOnly = true)
    public List<FeedbackDTO> buscarPorCliente(Long idCliente) {
        return feedbackRepository.findByClienteIdCliente(idCliente).stream()
                .map(this::converterParaDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<FeedbackDTO> buscarPorTipo(Feedback.TipoFeedback tipo) {
        return feedbackRepository.findByTipo(tipo).stream()
                .map(this::converterParaDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<FeedbackDTO> buscarPorPeriodo(LocalDateTime inicio, LocalDateTime fim) {

        return feedbackRepository.findByDataFeedbackBetweenWithCliente(inicio, fim).stream()
                .map(this::converterParaDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public FeedbackDTO salvar(FeedbackDTO feedbackDTO) {

        if (feedbackDTO.getIdVenda() != null) {
            feedbackRepository.findByVendaIdVenda(feedbackDTO.getIdVenda())
                    .ifPresent(f -> {
                        throw new IllegalArgumentException("Já existe um feedback registrado para esta venda.");
                    });
        }

        Feedback feedback = new Feedback();
        feedback.setTipo(feedbackDTO.getTipo());
        feedback.setNota(feedbackDTO.getNota());
        feedback.setComentario(feedbackDTO.getComentario());
        feedback.setDataFeedback(LocalDateTime.now());

        // Associar cliente se informado
        if (feedbackDTO.getIdCliente() != null) {
            Cliente cliente = clienteRepository.findById(feedbackDTO.getIdCliente())
                    .orElseThrow(() -> new ResourceNotFoundException("Cliente não encontrado com o id: " + feedbackDTO.getIdCliente()));

            feedback.setCliente(cliente);
        }

        // Associar venda se informada
        if (feedbackDTO.getIdVenda() != null) {
            Venda venda = vendaRepository.findById(feedbackDTO.getIdVenda())
                    .orElseThrow(() -> new ResourceNotFoundException("Venda não encontrada com o id: " + feedbackDTO.getIdVenda()));

            feedback.setVenda(venda);
        }

        feedback = feedbackRepository.save(feedback);

        return converterParaDTO(feedback);
    }

    @Transactional
    public void excluir(Long id) {
        if (!feedbackRepository.existsById(id)) {
            throw new ResourceNotFoundException("Feedback não encontrado com o id: " + id);
        }

        feedbackRepository.deleteById(id);
    }

    // ========== MÉTODOS DE MÉDIA DE AVALIAÇÕES ==========

    @Transactional(readOnly = true)
    public Double calcularMediaAvaliacoes() {
        try {
            Double media = feedbackRepository.mediaAvaliacoes();
            return media != null ? media : 0.0;
        } catch (Exception e) {
            System.err.println("Erro ao calcular média geral de avaliações: " + e.getMessage());
            return 0.0;
        }
    }

    @Transactional(readOnly = true)
    public Double calcularMediaAvaliacoesPorPeriodo(LocalDateTime inicio, LocalDateTime fim) {
        try {
            Double media = feedbackRepository.mediaAvaliacoesPorPeriodo(inicio, fim);
            return media != null ? media : 0.0;
        } catch (Exception e) {
            System.err.println("Erro ao calcular média de avaliações por período: " + e.getMessage());
            return 0.0;
        }
    }

    // ========== GERAÇÃO DE RELATÓRIOS ==========

    @Transactional(readOnly = true)
    public Map<String, Object> gerarRelatorio(LocalDateTime inicio, LocalDateTime fim) {
        // 🔍 DEBUG: Log das datas recebidas
        System.out.println("=== GERANDO RELATÓRIO DE FEEDBACKS ===");
        System.out.println("Data início recebida: " + inicio);
        System.out.println("Data fim recebida: " + fim);

        Map<String, Object> relatorio = new HashMap<>();


        List<FeedbackDTO> feedbacks = buscarPorPeriodo(inicio, fim);
        System.out.println("Feedbacks encontrados no período: " + feedbacks.size());

        relatorio.put("totalFeedbacks", feedbacks.size());

        // Média de notas no período
        Double notaMedia = feedbacks.stream()
                .mapToInt(FeedbackDTO::getNota)
                .average()
                .orElse(0.0);
        relatorio.put("notaMedia", notaMedia);
        System.out.println("Nota média calculada: " + notaMedia);


        List<Map<String, Object>> feedbacksPorTipo = feedbackRepository.countFeedbacksPorTipo(inicio, fim);
        System.out.println("Feedbacks por tipo: " + feedbacksPorTipo);
        relatorio.put("feedbacksPorTipo", feedbacksPorTipo);


        List<Map<String, Object>> feedbacksPorNota = feedbackRepository.countFeedbacksPorNota(inicio, fim);
        System.out.println("Feedbacks por nota: " + feedbacksPorNota);
        relatorio.put("feedbacksPorNota", feedbacksPorNota);


        List<Feedback> ultimosFeedbacks = feedbackRepository.findUltimosFeedbacks(inicio, fim);
        System.out.println("Últimos feedbacks encontrados: " + ultimosFeedbacks.size());
        relatorio.put("ultimosFeedbacks", ultimosFeedbacks.stream()
                .map(this::converterParaDTO)
                .collect(Collectors.toList()));

        System.out.println("====================================");
        return relatorio;
    }

    // ========== MÉTODOS AUXILIARES ==========


    private FeedbackDTO converterParaDTO(Feedback feedback) {
        FeedbackDTO dto = new FeedbackDTO(
                feedback.getIdFeedback(),
                null,  // idCliente - será preenchido abaixo se existir
                null,  // nomeCliente - será preenchido abaixo se existir
                null,  // cpfCliente - será preenchido abaixo se existir
                null,  // telefoneCliente - será preenchido abaixo se existir
                feedback.getVenda() != null ? feedback.getVenda().getIdVenda() : null,
                feedback.getTipo(),
                feedback.getNota(),
                feedback.getComentario(),
                feedback.getDataFeedback()
        );

        if (feedback.getCliente() != null) {
            dto.setIdCliente(feedback.getCliente().getIdCliente());
            dto.setNomeCliente(feedback.getCliente().getNomeCompleto());
            dto.setCpfCliente(feedback.getCliente().getCpf());
            dto.setTelefoneCliente(feedback.getCliente().getTelefone());
        }

        return dto;
    }
}