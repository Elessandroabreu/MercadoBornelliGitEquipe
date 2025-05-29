package com.mercadobornelli.repository;

import com.mercadobornelli.model.Produto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProdutoRepository extends JpaRepository<Produto, Long> {

    @Query("SELECT p FROM Produto p WHERE p.excluido = false")
    List<Produto> findAllAtivos();

    @Query("SELECT p FROM Produto p WHERE p.excluido = true")
    List<Produto> findAllExcluidos();

    @Query("SELECT p FROM Produto p WHERE LOWER(p.nomeProduto) LIKE LOWER(CONCAT('%', :nome, '%')) AND p.excluido = false")
    List<Produto> findByNomeContainingIgnoreCase(@Param("nome") String nome);

    @Query("SELECT p FROM Produto p WHERE p.codigoBarras = :codigo AND p.excluido = false")
    Optional<Produto> findByCodigoBarras(@Param("codigo") String codigo);

    @Query("SELECT p FROM Produto p WHERE p.categoria = :categoria AND p.excluido = false")
    List<Produto> findByCategoria(@Param("categoria") String categoria);

    @Query("SELECT p FROM Produto p WHERE p.fornecedor.idFornecedor = :idFornecedor AND p.excluido = false")
    List<Produto> findByFornecedor(@Param("idFornecedor") Long idFornecedor);

    @Query("SELECT p FROM Produto p WHERE p.quantidadeEstoque <= :quantidade AND p.excluido = false")
    List<Produto> findByEstoqueBaixo(@Param("quantidade") Integer quantidade);

    @Modifying
    @Query("UPDATE Produto p SET p.quantidadeEstoque = p.quantidadeEstoque + :quantidade WHERE p.idProduto = :id")
    void atualizarEstoque(@Param("id") Long id, @Param("quantidade") Integer quantidade);

    @Modifying
    @Query("UPDATE Produto p SET p.excluido = true WHERE p.idProduto = :id")
    void softDelete(@Param("id") Long id);

    @Modifying
    @Query("UPDATE Produto p SET p.excluido = false WHERE p.idProduto = :id")
    void restaurar(@Param("id") Long id);
}