package com.mercadobornelli.repository;

import com.mercadobornelli.model.Venda;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

// 🔧 CORREÇÃO: Import correto do Pageable
import org.springframework.data.domain.Pageable;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Repository
public interface VendaRepository extends JpaRepository<Venda, Long> {

    List<Venda> findByClienteIdCliente(Long idCliente);


    List<Venda> findByDataVendaBetween(LocalDateTime inicio, LocalDateTime fim);

    @Query("SELECT COUNT(v) FROM Venda v WHERE v.dataVenda BETWEEN :inicio AND :fim")
    Long countVendasPorPeriodo(@Param("inicio") LocalDateTime inicio, @Param("fim") LocalDateTime fim);

    @Query("SELECT SUM(v.valorTotal) FROM Venda v WHERE v.dataVenda BETWEEN :inicio AND :fim")
    BigDecimal somaTotalVendasPorPeriodo(@Param("inicio") LocalDateTime inicio, @Param("fim") LocalDateTime fim);

    @Query(value = "SELECT v.forma_pagamento as formaPagamento, COUNT(v.id_venda) as quantidade " +
            "FROM tb_venda v " +
            "WHERE v.dt_venda BETWEEN :inicio AND :fim " +
            "GROUP BY v.forma_pagamento", nativeQuery = true)
    List<Map<String, Object>> countVendasPorFormaPagamento(@Param("inicio") LocalDateTime inicio, @Param("fim") LocalDateTime fim);


    @Query("SELECT v FROM Venda v ORDER BY v.dataVenda DESC")
    List<Venda> findTop5ByOrderByDataVendaDesc(Pageable pageable);


    @Query(value = "SELECT * FROM tb_venda ORDER BY dt_venda DESC LIMIT 5", nativeQuery = true)
    List<Venda> findTop5VendasRecentes();

    @Query(value = "SELECT p.id_produto as idProduto, p.nm_produto as nomeProduto, " +
            "SUM(i.qtd_produto) as quantidadeVendida, " +
            "SUM(i.vl_subtotal) as valorTotal, " +
            "SUM(i.qtd_produto * p.vl_compra) as custoTotal " +
            "FROM tb_item_venda i " +
            "JOIN tb_produto p ON i.id_produto = p.id_produto " +
            "JOIN tb_venda v ON i.id_venda = v.id_venda " +
            "WHERE v.dt_venda BETWEEN :inicio AND :fim " +
            "GROUP BY p.id_produto, p.nm_produto " +
            "ORDER BY quantidadeVendida DESC " +
            "LIMIT :limit", nativeQuery = true)
    List<Map<String, Object>> findProdutosMaisVendidosPorPeriodo(
            @Param("inicio") LocalDateTime inicio,
            @Param("fim") LocalDateTime fim,
            @Param("limit") int limit);

    @Query(value = "SELECT MONTH(v.dt_venda) as mes, " +
            "SUM(v.vl_total) as faturamento, " +
            "SUM(v.vl_total) - COALESCE(SUM(custos.custo_total), 0) as lucro " +
            "FROM tb_venda v " +
            "LEFT JOIN (" +
            "   SELECT iv.id_venda, SUM(iv.qtd_produto * p.vl_compra) as custo_total " +
            "   FROM tb_item_venda iv " +
            "   JOIN tb_produto p ON iv.id_produto = p.id_produto " +
            "   GROUP BY iv.id_venda" +
            ") custos ON v.id_venda = custos.id_venda " +
            "WHERE YEAR(v.dt_venda) = :ano " +
            "GROUP BY MONTH(v.dt_venda) " +
            "ORDER BY mes", nativeQuery = true)
    List<Map<String, Object>> faturamentoPorMes(@Param("ano") int ano);
}