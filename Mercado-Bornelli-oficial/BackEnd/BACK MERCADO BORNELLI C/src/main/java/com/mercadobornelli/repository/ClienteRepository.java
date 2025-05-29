package com.mercadobornelli.repository;

import com.mercadobornelli.model.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ClienteRepository extends JpaRepository<Cliente, Long> {

    @Query("SELECT c FROM Cliente c WHERE c.excluido = false")
    List<Cliente> findAllAtivos();

    @Query("SELECT c FROM Cliente c WHERE c.excluido = true")
    List<Cliente> findAllExcluidos();

    @Query("SELECT c FROM Cliente c WHERE LOWER(c.nomeCompleto) LIKE LOWER(CONCAT('%', :nome, '%')) AND c.excluido = false")
    List<Cliente> findByNomeContainingIgnoreCase(@Param("nome") String nome);

    @Query("SELECT c FROM Cliente c WHERE c.cpf = :cpf AND c.excluido = false")
    Optional<Cliente> findByCpf(@Param("cpf") String cpf);

    @Query("SELECT c FROM Cliente c WHERE c.email = :email AND c.excluido = false")
    Optional<Cliente> findByEmail(@Param("email") String email);

    @Modifying
    @Query("UPDATE Cliente c SET c.excluido = true WHERE c.idCliente = :id")
    void softDelete(@Param("id") Long id);

    @Modifying
    @Query("UPDATE Cliente c SET c.excluido = false WHERE c.idCliente = :id")
    void restaurar(@Param("id") Long id);

    // 🔧 CORRETO: Usando dataCriacao que existe na entidade
    @Query("SELECT c FROM Cliente c WHERE c.excluido = false AND c.dataCriacao >= :inicio AND c.dataCriacao <= :fim")
    List<Cliente> findClientesPorPeriodo(@Param("inicio") LocalDateTime inicio, @Param("fim") LocalDateTime fim);

    @Query("SELECT COUNT(c) FROM Cliente c WHERE c.excluido = false AND c.dataCriacao >= :inicio AND c.dataCriacao <= :fim")
    Long countClientesPorPeriodo(@Param("inicio") LocalDateTime inicio, @Param("fim") LocalDateTime fim);
}