package com.mercadobornelli.repository;

import com.mercadobornelli.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByUsername(String username);

    boolean existsByUsername(String username);

    @Modifying
    @Query("UPDATE Usuario u SET u.ultimoAcesso = :dataAcesso WHERE u.idUsuario = :id")
    void atualizarUltimoAcesso(@Param("id") Long id, @Param("dataAcesso") LocalDateTime dataAcesso);

    @Modifying
    @Query("UPDATE Usuario u SET u.ativo = :ativo WHERE u.idUsuario = :id")
    void alterarStatus(@Param("id") Long id, @Param("ativo") boolean ativo);
}