package com.mercadobornelli.repository;

import com.mercadobornelli.model.Fornecedor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FornecedorRepository extends JpaRepository<Fornecedor, Long> {

    @Query("SELECT f FROM Fornecedor f WHERE f.excluido = false")
    List<Fornecedor> findAllAtivos();


    @Query("SELECT f FROM Fornecedor f WHERE " +
            "f.cnpj = :cnpj OR " +
            "REPLACE(REPLACE(REPLACE(f.cnpj, '.', ''), '/', ''), '-', '') = REPLACE(REPLACE(REPLACE(:cnpj, '.', ''), '/', ''), '-', '') AND " +
            "f.excluido = false")
    Optional<Fornecedor> findByCnpjFlexivel(@Param("cnpj") String cnpj);

    @Query("SELECT f FROM Fornecedor f WHERE f.excluido = true")
    List<Fornecedor> findAllExcluidos();

    @Query("SELECT f FROM Fornecedor f WHERE LOWER(f.nomeEmpresa) LIKE LOWER(CONCAT('%', :nome, '%')) AND f.excluido = false")
    List<Fornecedor> findByNomeContainingIgnoreCase(@Param("nome") String nome);

    @Query("SELECT f FROM Fornecedor f WHERE f.cnpj = :cnpj AND f.excluido = false")
    Optional<Fornecedor> findByCnpj(@Param("cnpj") String cnpj);

    @Modifying
    @Query("UPDATE Fornecedor f SET f.excluido = true WHERE f.idFornecedor = :id")
    void softDelete(@Param("id") Long id);

    @Modifying
    @Query("UPDATE Fornecedor f SET f.excluido = false WHERE f.idFornecedor = :id")
    void restaurar(@Param("id") Long id);
}