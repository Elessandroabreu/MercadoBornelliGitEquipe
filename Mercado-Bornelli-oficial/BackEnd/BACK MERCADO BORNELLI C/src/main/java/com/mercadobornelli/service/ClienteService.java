package com.mercadobornelli.service;

import com.mercadobornelli.dto.AcessoClienteDTO;
import com.mercadobornelli.dto.ClienteDTO;
import com.mercadobornelli.exception.ResourceNotFoundException;
import com.mercadobornelli.model.AcessoCliente;
import com.mercadobornelli.model.Cliente;
import com.mercadobornelli.repository.AcessoClienteRepository;
import com.mercadobornelli.repository.ClienteRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ClienteService {

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private AcessoClienteRepository acessoClienteRepository;

    @Transactional(readOnly = true)
    public List<ClienteDTO> listarTodos() {
        return clienteRepository.findAllAtivos().stream()
                .map(this::converterParaDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ClienteDTO> listarExcluidos() {
        return clienteRepository.findAllExcluidos().stream()
                .map(this::converterParaDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ClienteDTO buscarPorId(Long id) {
        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente não encontrado com o id: " + id));

        if (cliente.isExcluido()) {
            throw new ResourceNotFoundException("Cliente não encontrado ou foi excluído.");
        }

        return converterParaDTO(cliente);
    }

    @Transactional(readOnly = true)
    public ClienteDTO buscarPorCpf(String cpf) {
        Cliente cliente = clienteRepository.findByCpf(cpf)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente não encontrado com o CPF: " + cpf));

        return converterParaDTO(cliente);
    }

    @Transactional(readOnly = true)
    public List<ClienteDTO> buscarPorNome(String nome) {
        return clienteRepository.findByNomeContainingIgnoreCase(nome).stream()
                .map(this::converterParaDTO)
                .collect(Collectors.toList());
    }

    //Buscar clientes por período de cadastro
    @Transactional(readOnly = true)
    public List<ClienteDTO> buscarPorPeriodo(LocalDateTime inicio, LocalDateTime fim) {
        System.out.println("=== SERVICE: Buscando clientes por período ===");
        System.out.println("Data início: " + inicio);
        System.out.println("Data fim: " + fim);

        try {
            List<Cliente> clientes = clienteRepository.findClientesPorPeriodo(inicio, fim);
            System.out.println("Clientes encontrados no repositório: " + clientes.size());

            List<ClienteDTO> clientesDTO = clientes.stream()
                    .map(this::converterParaDTO)
                    .collect(Collectors.toList());

            System.out.println("DTOs convertidos: " + clientesDTO.size());
            return clientesDTO;

        } catch (Exception e) {
            System.err.println("Erro no service ao buscar clientes por período: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    //Contar clientes por período de cadastro
    @Transactional(readOnly = true)
    public Long contarClientesPorPeriodo(LocalDateTime inicio, LocalDateTime fim) {
        System.out.println("=== SERVICE: Contando clientes por período ===");
        try {
            Long count = clienteRepository.countClientesPorPeriodo(inicio, fim);
            System.out.println("Contagem retornada: " + count);
            return count;
        } catch (Exception e) {
            System.err.println("Erro no service ao contar clientes: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @Transactional
    public ClienteDTO salvar(ClienteDTO clienteDTO) {
        // Verificar se o CPF já existe
        clienteRepository.findByCpf(clienteDTO.getCpf())
                .ifPresent(c -> {
                    if (!c.getIdCliente().equals(clienteDTO.getIdCliente())) {
                        throw new IllegalArgumentException("CPF já cadastrado.");
                    }
                });


        if (clienteDTO.getEmail() != null && !clienteDTO.getEmail().isEmpty()) {
            clienteRepository.findByEmail(clienteDTO.getEmail())
                    .ifPresent(c -> {
                        if (!c.getIdCliente().equals(clienteDTO.getIdCliente())) {
                            throw new IllegalArgumentException("Email já cadastrado.");
                        }
                    });
        }

        Cliente cliente = converterParaEntidade(clienteDTO);
        cliente = clienteRepository.save(cliente);

        return converterParaDTO(cliente);
    }

    @Transactional
    public ClienteDTO atualizar(Long id, ClienteDTO clienteDTO) {
        Cliente clienteExistente = clienteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente não encontrado com o id: " + id));

        if (clienteExistente.isExcluido()) {
            throw new ResourceNotFoundException("Cliente não encontrado ou foi excluído.");
        }


        clienteExistente.setNomeCompleto(clienteDTO.getNomeCompleto());
        clienteExistente.setCpf(clienteDTO.getCpf());
        clienteExistente.setEmail(clienteDTO.getEmail());
        clienteExistente.setTelefone(clienteDTO.getTelefone());

        clienteExistente = clienteRepository.save(clienteExistente);

        return converterParaDTO(clienteExistente);
    }

    @Transactional
    public void excluir(Long id) {
        if (!clienteRepository.existsById(id)) {
            throw new ResourceNotFoundException("Cliente não encontrado com o id: " + id);
        }

        clienteRepository.softDelete(id);
    }

    @Transactional
    public void restaurar(Long id) {
        if (!clienteRepository.existsById(id)) {
            throw new ResourceNotFoundException("Cliente não encontrado com o id: " + id);
        }

        clienteRepository.restaurar(id);
    }

    @Transactional(readOnly = true)
    public List<AcessoClienteDTO> listarAcessos(Long idCliente) {
        Cliente cliente = clienteRepository.findById(idCliente)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente não encontrado com o id: " + idCliente));

        return acessoClienteRepository.findByClienteIdCliente(idCliente).stream()
                .map(this::converterAcessoParaDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public void registrarAcesso(Long idCliente, String acao, HttpServletRequest request) {
        Cliente cliente = clienteRepository.findById(idCliente)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente não encontrado com o id: " + idCliente));

        AcessoCliente acesso = new AcessoCliente();
        acesso.setCliente(cliente);
        acesso.setAcaoRealizada(acao);
        acesso.setIpDispositivo(obterIpCliente(request));

        acessoClienteRepository.save(acesso);
    }

    // Métodos auxiliares
    private ClienteDTO converterParaDTO(Cliente cliente) {
        return new ClienteDTO(
                cliente.getIdCliente(),
                cliente.getNomeCompleto(),
                cliente.getCpf(),
                cliente.getEmail(),
                cliente.getTelefone()
        );
    }

    private Cliente converterParaEntidade(ClienteDTO dto) {
        Cliente cliente = new Cliente();

        if (dto.getIdCliente() != null) {
            cliente.setIdCliente(dto.getIdCliente());
        }

        cliente.setNomeCompleto(dto.getNomeCompleto());
        cliente.setCpf(dto.getCpf());
        cliente.setEmail(dto.getEmail());
        cliente.setTelefone(dto.getTelefone());

        return cliente;
    }

    private AcessoClienteDTO converterAcessoParaDTO(AcessoCliente acesso) {
        return new AcessoClienteDTO(
                acesso.getIdAcesso(),
                acesso.getCliente().getIdCliente(),
                acesso.getCliente().getNomeCompleto(),
                acesso.getDataHoraAcesso(),
                acesso.getAcaoRealizada(),
                acesso.getIpDispositivo()
        );
    }

    private String obterIpCliente(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        return ip;
    }
}