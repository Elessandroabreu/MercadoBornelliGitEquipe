package com.mercadobornelli.service;

import com.mercadobornelli.dto.ItemVendaDTO;
import com.mercadobornelli.dto.VendaDTO;
import com.mercadobornelli.exception.ResourceNotFoundException;
import com.mercadobornelli.model.Cliente;
import com.mercadobornelli.model.ItemVenda;
import com.mercadobornelli.model.Produto;
import com.mercadobornelli.model.Venda;
import com.mercadobornelli.repository.ClienteRepository;
import com.mercadobornelli.repository.ProdutoRepository;
import com.mercadobornelli.repository.VendaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class VendaService {

    @Autowired
    private VendaRepository vendaRepository;

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private ProdutoRepository produtoRepository;

    @Autowired
    private ProdutoService produtoService;

    @Transactional(readOnly = true)
    public List<VendaDTO> listarTodas() {
        return vendaRepository.findAll().stream()
                .map(this::converterParaDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public VendaDTO buscarPorId(Long id) {
        Venda venda = vendaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Venda não encontrada com o id: " + id));

        return converterParaDTO(venda);
    }

    @Transactional(readOnly = true)
    public List<VendaDTO> buscarPorCliente(Long idCliente) {
        return vendaRepository.findByClienteIdCliente(idCliente).stream()
                .map(this::converterParaDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<VendaDTO> buscarPorPeriodo(LocalDateTime inicio, LocalDateTime fim) {
        // Ajusta o fim para incluir até 23:59:59.999999999 do dia
        LocalDateTime fimAjustado = fim.withHour(23).withMinute(59).withSecond(59).withNano(999_999_999);

        return vendaRepository.findByDataVendaBetween(inicio, fimAjustado).stream()
                .map(this::converterParaDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public VendaDTO salvar(VendaDTO vendaDTO) {
        // Validar se há itens na venda
        if (vendaDTO.getItens() == null || vendaDTO.getItens().isEmpty()) {
            throw new IllegalArgumentException("A venda deve ter pelo menos um item.");
        }

        Venda venda = new Venda();
        venda.setDataVenda(LocalDateTime.now());
        venda.setFormaPagamento(vendaDTO.getFormaPagamento());
        venda.setValorTotal(BigDecimal.ZERO);

        // Associar cliente se informado
        if (vendaDTO.getIdCliente() != null) {
            Cliente cliente = clienteRepository.findById(vendaDTO.getIdCliente())
                    .orElseThrow(() -> new ResourceNotFoundException("Cliente não encontrado com o id: " + vendaDTO.getIdCliente()));

            venda.setCliente(cliente);
        }

        // Calcular o valor total antes da primeira persistência
        BigDecimal totalVenda = BigDecimal.ZERO;

        for (ItemVendaDTO itemDTO : vendaDTO.getItens()) {
            Produto produto = produtoRepository.findById(itemDTO.getIdProduto())
                    .orElseThrow(() -> new ResourceNotFoundException("Produto não encontrado com o id: " + itemDTO.getIdProduto()));

            // Verificar se há estoque suficiente
            if (produto.getQuantidadeEstoque() < itemDTO.getQuantidade()) {
                throw new IllegalArgumentException("Estoque insuficiente para o produto: " + produto.getNomeProduto());
            }

            // Calcular subtotal
            BigDecimal precoUnitario = produto.getPrecoVenda();
            BigDecimal subtotal = precoUnitario.multiply(new BigDecimal(itemDTO.getQuantidade()));

            // Acumular no total da venda
            totalVenda = totalVenda.add(subtotal);
        }

        // Definir o valor total calculado
        venda.setValorTotal(totalVenda);

        // Persistir a venda primeiro para ter o ID
        venda = vendaRepository.save(venda);

        // Adicionar itens à venda
        List<ItemVenda> itens = new ArrayList<>();

        for (ItemVendaDTO itemDTO : vendaDTO.getItens()) {
            Produto produto = produtoRepository.findById(itemDTO.getIdProduto())
                    .orElseThrow(() -> new ResourceNotFoundException("Produto não encontrado com o id: " + itemDTO.getIdProduto()));

            // Atualizar estoque
            produtoService.atualizarEstoque(produto.getIdProduto(), -itemDTO.getQuantidade());

            // Criar item da venda
            ItemVenda item = new ItemVenda();
            item.setVenda(venda);
            item.setProduto(produto);
            item.setQuantidade(itemDTO.getQuantidade());
            item.setPrecoUnitario(produto.getPrecoVenda());

            itens.add(item);
            venda.adicionarItem(item);
        }

        // Atualizar a venda com os itens e o valor total
        venda = vendaRepository.save(venda);

        return converterParaDTO(venda);
    }

    @Transactional
    public void cancelar(Long id) {
        Venda venda = vendaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Venda não encontrada com o id: " + id));

        // Devolver os produtos ao estoque
        for (ItemVenda item : venda.getItens()) {
            produtoService.atualizarEstoque(item.getProduto().getIdProduto(), item.getQuantidade());
        }


        vendaRepository.delete(venda);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> gerarRelatorioPersonalizado(LocalDateTime inicio, LocalDateTime fim) {
        // Ajusta fim para o último instante do dia
        LocalDateTime fimAjustado = fim.withHour(23).withMinute(59).withSecond(59).withNano(999_999_999);

        Map<String, Object> relatorio = new HashMap<>();

        Long quantidadeVendas = vendaRepository.countVendasPorPeriodo(inicio, fimAjustado);
        relatorio.put("quantidadeVendas", quantidadeVendas);

        BigDecimal faturamentoBruto = vendaRepository.somaTotalVendasPorPeriodo(inicio, fimAjustado);
        relatorio.put("faturamentoBruto", faturamentoBruto != null ? faturamentoBruto : BigDecimal.ZERO);

        List<Map<String, Object>> vendasPorFormaPagamento = vendaRepository.countVendasPorFormaPagamento(inicio, fimAjustado);
        relatorio.put("vendasPorFormaPagamento", vendasPorFormaPagamento);

        List<Map<String, Object>> produtosMaisVendidos = vendaRepository.findProdutosMaisVendidosPorPeriodo(inicio, fimAjustado, 10);
        relatorio.put("produtosMaisVendidos", produtosMaisVendidos);

        Integer quantidadeProdutosVendidos = calcularQuantidadeProdutosVendidos(produtosMaisVendidos);
        relatorio.put("quantidadeProdutosVendidos", quantidadeProdutosVendidos);

        BigDecimal lucroLiquido = calcularLucroLiquidoReal(produtosMaisVendidos);
        relatorio.put("lucroLiquido", lucroLiquido);

        return relatorio;
    }


    @Transactional(readOnly = true)
    public Map<String, Object> gerarRelatorioMensal(int ano, int mes) {
        LocalDateTime inicio = LocalDateTime.of(ano, mes, 1, 0, 0);
        LocalDateTime fim = inicio.with(TemporalAdjusters.lastDayOfMonth()).withHour(23).withMinute(59).withSecond(59);

        return gerarRelatorioPersonalizado(inicio, fim);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> gerarRelatorioAnual(int ano) {
        LocalDateTime inicio = LocalDateTime.of(ano, 1, 1, 0, 0);
        LocalDateTime fim = LocalDateTime.of(ano, 12, 31, 23, 59, 59);

        Map<String, Object> relatorio = gerarRelatorioPersonalizado(inicio, fim);

        // Adicionar faturamento e lucro por mês
        List<Map<String, Object>> faturamentoPorMes = vendaRepository.faturamentoPorMes(ano);
        relatorio.put("vendasPorMes", faturamentoPorMes);

        return relatorio;
    }


    private VendaDTO converterParaDTO(Venda venda) {
        VendaDTO dto = new VendaDTO(
                venda.getIdVenda(),
                venda.getDataVenda(),
                null,
                null,
                venda.getFormaPagamento(),
                venda.getValorTotal()
        );

        if (venda.getCliente() != null) {
            dto.setIdCliente(venda.getCliente().getIdCliente());
            dto.setNomeCliente(venda.getCliente().getNomeCompleto());
        }

        // Converter itens da venda
        List<ItemVendaDTO> itensDTO = venda.getItens().stream()
                .map(this::converterItemParaDTO)
                .collect(Collectors.toList());

        dto.setItens(itensDTO);

        return dto;
    }

    private ItemVendaDTO converterItemParaDTO(ItemVenda item) {
        return new ItemVendaDTO(
                item.getIdItemVenda(),
                item.getProduto().getIdProduto(),
                item.getProduto().getNomeProduto(),
                item.getQuantidade(),
                item.getPrecoUnitario()
        );
    }

    private Integer calcularQuantidadeProdutosVendidos(List<Map<String, Object>> produtosMaisVendidos) {
        if (produtosMaisVendidos == null || produtosMaisVendidos.isEmpty()) {
            return 0;
        }

        return produtosMaisVendidos.stream()
                .mapToInt(p -> ((Number) p.get("quantidadeVendida")).intValue())
                .sum();
    }

    // Método que calcula o lucro real usando a diferença entre preço de venda e preço de compra
    private BigDecimal calcularLucroLiquidoReal(List<Map<String, Object>> produtosMaisVendidos) {
        if (produtosMaisVendidos == null || produtosMaisVendidos.isEmpty()) {
            return BigDecimal.ZERO;
        }

        BigDecimal faturamentoBruto = produtosMaisVendidos.stream()
                .map(p -> (BigDecimal) p.get("valorTotal"))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal custoTotal = produtosMaisVendidos.stream()
                .map(p -> (BigDecimal) p.get("custoTotal"))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return faturamentoBruto.subtract(custoTotal);
    }

    // O método antigo mantido para compatibilidade
    private BigDecimal calcularLucroLiquido(List<Map<String, Object>> produtosMaisVendidos) {
        if (produtosMaisVendidos == null || produtosMaisVendidos.isEmpty()) {
            return BigDecimal.ZERO;
        }

        return produtosMaisVendidos.stream()
                .map(p -> (BigDecimal) p.get("valorTotal"))
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .multiply(new BigDecimal("0.3")); // Estimativa simplificada: 30% do faturamento é lucro
    }
}