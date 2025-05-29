package com.mercadobornelli.repository;

import com.mercadobornelli.model.AcessoCliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AcessoClienteRepository extends JpaRepository<AcessoCliente, Long> {

    List<AcessoCliente> findByClienteIdCliente(Long idCliente);

    List<AcessoCliente> findByDataHoraAcessoBetween(LocalDateTime inicio, LocalDateTime fim);

    @Query("SELECT a FROM AcessoCliente a WHERE a.cliente.idCliente = :idCliente ORDER BY a.dataHoraAcesso DESC")
    List<AcessoCliente> findUltimosAcessosCliente(@Param("idCliente") Long idCliente);

    @Query("SELECT a FROM AcessoCliente a WHERE a.cliente.idCliente = :idCliente AND a.dataHoraAcesso BETWEEN :inicio AND :fim ORDER BY a.dataHoraAcesso DESC")
    List<AcessoCliente> findAcessosClientePorPeriodo(
            @Param("idCliente") Long idCliente,
            @Param("inicio") LocalDateTime inicio,
            @Param("fim") LocalDateTime fim);
}