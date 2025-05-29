package com.mercadobornelli.dto;

import java.util.Set;

public class JwtResponseDTO {

    private String token;
    private String type = "Bearer";
    private String username;
    private Set<String> perfis;

    public JwtResponseDTO(String token, String username, Set<String> perfis) {
        this.token = token;
        this.username = username;
        this.perfis = perfis;
    }


    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public Set<String> getPerfis() {
        return perfis;
    }

    public void setPerfis(Set<String> perfis) {
        this.perfis = perfis;
    }
}