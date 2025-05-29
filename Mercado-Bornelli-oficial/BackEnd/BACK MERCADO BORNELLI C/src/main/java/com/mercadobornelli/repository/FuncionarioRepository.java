package com.mercadobornelli.repository;

import com.mercadobornelli.model.Funcionario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FuncionarioRepository extends JpaRepository<Funcionario, Long> {

    @Query("SELECT f FROM Funcionario f WHERE f.excluido = false")
    List<Funcionario> findAllAtivos();

    @Query("SELECT f FROM Funcionario f WHERE f.excluido = true")
    List<Funcionario> findAllExcluidos();

    @Query("SELECT f FROM Funcionario f WHERE LOWER(f.nomeCompleto) LIKE LOWER(CONCAT('%', :nome, '%')) AND f.excluido = false")
    List<Funcionario> findByNomeContainingIgnoreCase(@Param("nome") String nome);

    @Query("SELECT f FROM Funcionario f WHERE f.cpf = :cpf AND f.excluido = false")
    Optional<Funcionario> findByCpf(@Param("cpf") String cpf);

    @Query("SELECT f FROM Funcionario f WHERE f.email = :email AND f.excluido = false")
    Optional<Funcionario> findByEmail(@Param("email") String email);

    @Query("SELECT f FROM Funcionario f WHERE f.cargo = :cargo AND f.excluido = false")
    List<Funcionario> findByCargo(@Param("cargo") Funcionario.Cargo cargo);

    @Query("SELECT f FROM Funcionario f WHERE f.status = :status AND f.excluido = false")
    List<Funcionario> findByStatus(@Param("status") Funcionario.Status status);

    @Modifying
    @Query("UPDATE Funcionario f SET f.excluido = true WHERE f.idFuncionario = :id")
    void softDelete(@Param("id") Long id);

    @Modifying
    @Query("UPDATE Funcionario f SET f.excluido = false WHERE f.idFuncionario = :id")
    void restaurar(@Param("id") Long id);
}