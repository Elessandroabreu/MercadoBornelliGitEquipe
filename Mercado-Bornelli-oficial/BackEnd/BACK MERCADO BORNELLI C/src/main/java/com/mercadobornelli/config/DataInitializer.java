package com.mercadobornelli.config;

import com.mercadobornelli.model.Usuario;
import com.mercadobornelli.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Bean
    CommandLineRunner initDatabase(UsuarioRepository usuarioRepository) {
        return args -> {
            // Criar o usuário administrador padrão se não existir
            if (!usuarioRepository.existsByUsername("admin")) {
                Usuario admin = new Usuario();
                admin.setUsername("admin");
                admin.setPassword(passwordEncoder.encode("admin123"));
                admin.setAtivo(true);
                admin.adicionarPerfil(Usuario.PerfilUsuario.ADMIN);

                usuarioRepository.save(admin);

                System.out.println("Usuário administrador padrão criado: admin / admin123");
            }
        };
    }
}