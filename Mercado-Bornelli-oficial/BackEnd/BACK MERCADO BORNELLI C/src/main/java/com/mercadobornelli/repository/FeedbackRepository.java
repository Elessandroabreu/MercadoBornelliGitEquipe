package com.mercadobornelli.repository;

import com.mercadobornelli.model.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {

    // ========== MÉTODOS DE BUSCA BÁSICOS ==========

    Optional<Feedback> findByVendaIdVenda(Long idVenda);

    List<Feedback> findByClienteIdCliente(Long idCliente);

    List<Feedback> findByTipo(Feedback.TipoFeedback tipo);

    List<Feedback> findByDataFeedbackBetween(LocalDateTime inicio, LocalDateTime fim);

    // ========== CONSULTAS DE MÉDIA ==========

    @Query("SELECT AVG(f.nota) FROM Feedback f")
    Double mediaAvaliacoes();

    @Query("SELECT AVG(f.nota) FROM Feedback f WHERE f.dataFeedback >= :inicio AND f.dataFeedback <= :fim")
    Double mediaAvaliacoesPorPeriodo(@Param("inicio") LocalDateTime inicio, @Param("fim") LocalDateTime fim);

    // ========== CONSULTAS OTIMIZADAS COM JOIN FETCH ==========

    @Query("SELECT f FROM Feedback f LEFT JOIN FETCH f.cliente LEFT JOIN FETCH f.venda ORDER BY f.dataFeedback DESC")
    List<Feedback> findAllWithClienteAndVenda();

    @Query("SELECT f FROM Feedback f LEFT JOIN FETCH f.cliente WHERE f.dataFeedback >= :inicio AND f.dataFeedback <= :fim ORDER BY f.dataFeedback DESC")
    List<Feedback> findUltimosFeedbacks(@Param("inicio") LocalDateTime inicio, @Param("fim") LocalDateTime fim);

    @Query("SELECT f FROM Feedback f LEFT JOIN FETCH f.cliente WHERE f.dataFeedback >= :inicio AND f.dataFeedback <= :fim")
    List<Feedback> findByDataFeedbackBetweenWithCliente(@Param("inicio") LocalDateTime inicio, @Param("fim") LocalDateTime fim);

    // ========== CONSULTAS DE RELATÓRIO ==========

    @Query("SELECT f.tipo AS tipo, COUNT(f) AS quantidade FROM Feedback f WHERE f.dataFeedback >= :inicio AND f.dataFeedback <= :fim GROUP BY f.tipo")
    List<Map<String, Object>> countFeedbacksPorTipo(@Param("inicio") LocalDateTime inicio, @Param("fim") LocalDateTime fim);

    @Query("SELECT f.nota AS nota, COUNT(f) AS quantidade FROM Feedback f WHERE f.dataFeedback >= :inicio AND f.dataFeedback <= :fim GROUP BY f.nota ORDER BY f.nota")
    List<Map<String, Object>> countFeedbacksPorNota(@Param("inicio") LocalDateTime inicio, @Param("fim") LocalDateTime fim);
}