package com.mercadobornelli.service;

import com.mercadobornelli.dto.JwtResponseDTO;
import com.mercadobornelli.dto.LoginDTO;
import com.mercadobornelli.dto.UsuarioDTO;
import com.mercadobornelli.exception.ResourceNotFoundException;
import com.mercadobornelli.model.Usuario;
import com.mercadobornelli.repository.UsuarioRepository;
import com.mercadobornelli.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private JwtUtils jwtUtils;

    @Transactional(readOnly = true)
    public List<UsuarioDTO> listarTodos() {
        return usuarioRepository.findAll().stream()
                .map(this::converterParaDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public UsuarioDTO buscarPorId(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado com o id: " + id));

        return converterParaDTO(usuario);
    }

    @Transactional(readOnly = true)
    public UsuarioDTO buscarPorUsername(String username) {
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado com o nome: " + username));

        return converterParaDTO(usuario);
    }

    @Transactional
    public UsuarioDTO salvar(UsuarioDTO usuarioDTO) {
        // Verificar se o username já existe
        if (usuarioRepository.existsByUsername(usuarioDTO.getUsername())) {
            throw new IllegalArgumentException("Nome de usuário já está em uso!");
        }

        Usuario usuario = new Usuario();
        usuario.setUsername(usuarioDTO.getUsername());
        usuario.setPassword(passwordEncoder.encode(usuarioDTO.getPassword()));
        usuario.setAtivo(true);

        // Adicionar perfis
        if (usuarioDTO.getPerfis() != null && !usuarioDTO.getPerfis().isEmpty()) {
            usuario.setPerfis(usuarioDTO.getPerfis());
        } else {
            usuario.adicionarPerfil(Usuario.PerfilUsuario.USER);
        }

        usuario = usuarioRepository.save(usuario);

        return converterParaDTO(usuario);
    }

    @Transactional
    public UsuarioDTO atualizar(Long id, UsuarioDTO usuarioDTO) {
        Usuario usuarioExistente = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado com o id: " + id));

        // Verificar se o username já existe e é diferente do atual
        if (!usuarioExistente.getUsername().equals(usuarioDTO.getUsername()) &&
                usuarioRepository.existsByUsername(usuarioDTO.getUsername())) {
            throw new IllegalArgumentException("Nome de usuário já está em uso!");
        }

        usuarioExistente.setUsername(usuarioDTO.getUsername());

        // Atualizar senha apenas se fornecida
        if (usuarioDTO.getPassword() != null && !usuarioDTO.getPassword().isEmpty()) {
            usuarioExistente.setPassword(passwordEncoder.encode(usuarioDTO.getPassword()));
        }

        // Atualizar perfis se fornecidos
        if (usuarioDTO.getPerfis() != null && !usuarioDTO.getPerfis().isEmpty()) {
            usuarioExistente.setPerfis(usuarioDTO.getPerfis());
        }

        usuarioExistente.setAtivo(usuarioDTO.isAtivo());

        usuarioExistente = usuarioRepository.save(usuarioExistente);

        return converterParaDTO(usuarioExistente);
    }

    @Transactional
    public void excluir(Long id) {
        if (!usuarioRepository.existsById(id)) {
            throw new ResourceNotFoundException("Usuário não encontrado com o id: " + id);
        }

        usuarioRepository.deleteById(id);
    }

    @Transactional
    public void alterarStatus(Long id, boolean ativo) {
        if (!usuarioRepository.existsById(id)) {
            throw new ResourceNotFoundException("Usuário não encontrado com o id: " + id);
        }

        usuarioRepository.alterarStatus(id, ativo);
    }

    @Transactional
    public JwtResponseDTO autenticar(LoginDTO loginDTO) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginDTO.getUsername(), loginDTO.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();

        // Atualizar último acesso
        Usuario usuario = usuarioRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));

        usuarioRepository.atualizarUltimoAcesso(usuario.getIdUsuario(), LocalDateTime.now());

        return new JwtResponseDTO(
                jwt,
                userDetails.getUsername(),
                userDetails.getAuthorities().stream()
                        .map(item -> item.getAuthority())
                        .collect(Collectors.toSet())
        );
    }

    // Métodos auxiliares
    private UsuarioDTO converterParaDTO(Usuario usuario) {
        return new UsuarioDTO(
                usuario.getIdUsuario(),
                usuario.getUsername(),
                usuario.getPerfis(),
                usuario.isAtivo()
        );
    }
}