const express = require('express');
const cors = require('cors');
const { pool } = require('./config');

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended : false}));
app.use(cors());

// API para tabela categorias
const getCategorias = async (request, response) => {
    try {
        // bloco do código a ser executado
        const { rows } = await pool.query('SELECT * FROM categorias order by codigo');
        return response.status(200).json(rows);
    } catch (err) {
        // bloco do tratamento de erro caso ele ocorra
        return response.status(400).json({
            status : 'error',
            message : 'Erro ao consultar as categorias: ' + err
        })
    }
}

const addCategoria = async (request, response) => {
    try {
        // bloco do código a ser executado
        const { nome } = request.body;
        const results = await pool.query(`INSERT INTO categorias (nome) 
        VALUES ($1) RETURNING codigo, nome`,[nome]);
        const linhainserida = results.rows[0];
        return response.status(200).json({
            status : "success" , message : "Categoria criada",
            objeto : linhainserida
        })
    } catch (err) {
        // bloco do tratamento de erro caso ele ocorra
        return response.status(400).json({
            status : 'error',
            message : 'Erro ao inserir a categoria: ' + err
        })
    }
}

const updateCategoria = async (request, response) => {
    try {
        // bloco do código a ser executado
        const { codigo, nome } = request.body;
        const results = await pool.query(`UPDATE categorias SET
        nome = $1 where codigo = $2 RETURNING codigo, nome`,[nome, codigo]);
        const linhaalterada = results.rows[0];
        return response.status(200).json({
            status : "success" , message : "Categoria alterada",
            objeto : linhaalterada
        })
    } catch (err) {
        // bloco do tratamento de erro caso ele ocorra
        return response.status(400).json({
            status : 'error',
            message : 'Erro ao atualizar a categoria: ' + err
        })
    }
}

const deleteCategoria = async (request, response) => {
    try {
        // bloco do código a ser executado
        const codigo = request.params.codigo;
        const results = await pool.query(`DELETE FROM categorias
        WHERE codigo = $1`,[codigo]);
        if (results.rowCount == 0){
            return response.status(400).json({
                status : 'error',
                message : `Nenhum registro com o código ${codigo} para ser removido`
            })  
        } else {
            return response.status(200).json({
                status : 'success', message : 'Categoria removida com sucesso!'
            })
        }
    } catch (err) {
        // bloco do tratamento de erro caso ele ocorra
        return response.status(400).json({
            status : 'error',
            message : 'Erro ao remover a categoria: ' + err
        })
    }
}

const getCategoriaPorCodigo = async (request, response) => {
    try {
        // bloco do código a ser executado
        const codigo = request.params.codigo;
        const results = await pool.query(`SELECT * FROM categorias
        WHERE codigo = $1`,[codigo]);
        if (results.rowCount == 0){
            return response.status(400).json({
                status : 'error',
                message : `Nenhum registro encontrado com o código ${codigo} `
            })  
        } else {
            const categoria = results.rows[0];
            return response.status(200).json(categoria);
        }
    } catch (err) {
        // bloco do tratamento de erro caso ele ocorra
        return response.status(400).json({
            status : 'error',
            message : 'Erro ao recuperar a categoria: ' + err
        })
    }
}

app.route('/categorias')
   .get(getCategorias)
   .post(addCategoria)
   .put(updateCategoria)

app.route('/categorias/:codigo')
   .delete(deleteCategoria)
   .get(getCategoriaPorCodigo)

// API para tabela produtos
const getProdutos = async (request, response) => {
    try {
        // bloco do código a ser executado
        const { rows } = await pool.query(`select p.codigo as codigo, 
        p.nome as nome, p.descricao as descricao,
        p.quantidade_estoque as quantidade_estoque, p.ativo as ativo, 
        p.valor as valor, to_char(p.data_cadastro,'YYYY-MM-DD') as data_cadastro, 
        p.categoria as categoria, c.nome as categoria_nome
        from produtos p
        join categorias c on p.categoria = c.codigo
        order by p.codigo`);
        return response.status(200).json(rows);
    } catch (err) {
        // bloco do tratamento de erro caso ele ocorra
        return response.status(400).json({
            status : 'error',
            message : 'Erro ao consultar os produtos: ' + err
        })
    }
}

const addProduto = async (request, response) => {
    try {
        // bloco do código a ser executado
        const { nome, descricao, quantidade_estoque, 
        ativo, valor, data_cadastro, categoria } = request.body;
        const results = await pool.query(`INSERT INTO produtos 
            (nome, descricao, quantidade_estoque, ativo, 
            valor, data_cadastro, categoria)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING codigo, nome, descricao, quantidade_estoque, ativo, 
            valor, to_char(data_cadastro,'YYYY-MM-DD') as data_cadastro, categoria`,
            [nome, descricao, quantidade_estoque, 
                ativo, valor, data_cadastro, categoria ]);
        const linhainserida = results.rows[0];
        return response.status(200).json({
            status : "success" , message : "Produto criado",
            objeto : linhainserida
        })
    } catch (err) {
        // bloco do tratamento de erro caso ele ocorra
        return response.status(400).json({
            status : 'error',
            message : 'Erro ao inserir o produto: ' + err
        })
    }
}

const updateProduto = async (request, response) => {
    try {
        // bloco do código a ser executado
        const { nome, descricao, quantidade_estoque, 
            ativo, valor, data_cadastro, categoria, codigo } = request.body;
        const results = await pool.query(`UPDATE produtos SET 
        nome = $1, descricao = $2,
        quantidade_estoque = $3, ativo = $4, valor = $5, 
        data_cadastro = $6, categoria = $7
        WHERE codigo = $8
        RETURNING codigo, nome, descricao, quantidade_estoque, ativo, 
        valor, to_char(data_cadastro,'YYYY-MM-DD') as data_cadastro, categoria`,
        [nome, descricao, quantidade_estoque, 
            ativo, valor, data_cadastro, categoria, codigo]);
        const linhaalterada = results.rows[0];
        return response.status(200).json({
            status : "success" , message : "Produto alterado",
            objeto : linhaalterada
        })
    } catch (err) {
        // bloco do tratamento de erro caso ele ocorra
        return response.status(400).json({
            status : 'error',
            message : 'Erro ao atualizar o produto: ' + err
        })
    }
}

const deleteProduto = async (request, response) => {
    try {
        // bloco do código a ser executado
        const codigo = request.params.codigo;
        const results = await pool.query(`DELETE FROM produtos
        WHERE codigo = $1`,[codigo]);
        if (results.rowCount == 0){
            return response.status(400).json({
                status : 'error',
                message : `Nenhum registro com o código ${codigo} para ser removido`
            })  
        } else {
            return response.status(200).json({
                status : 'success', message : 'Produto removido com sucesso!'
            })
        }
    } catch (err) {
        // bloco do tratamento de erro caso ele ocorra
        return response.status(400).json({
            status : 'error',
            message : 'Erro ao remover o produto: ' + err
        })
    }
}

const getProdutoPorCodigo = async (request, response) => {
    try {
        // bloco do código a ser executado
        const codigo = request.params.codigo;
        const results = await pool.query(`select p.codigo as codigo, 
        p.nome as nome, p.descricao as descricao,
        p.quantidade_estoque as quantidade_estoque, p.ativo as ativo, 
        p.valor as valor, to_char(p.data_cadastro,'YYYY-MM-DD') as data_cadastro, 
        p.categoria as categoria, c.nome as categoria_nome
        from produtos p
        join categorias c on p.categoria = c.codigo
        WHERE p.codigo = $1`,[codigo]);
        if (results.rowCount == 0){
            return response.status(400).json({
                status : 'error',
                message : `Nenhum registro encontrado com o código ${codigo} `
            })  
        } else {
            const produto = results.rows[0];
            return response.status(200).json(produto);
        }
    } catch (err) {
        // bloco do tratamento de erro caso ele ocorra
        return response.status(400).json({
            status : 'error',
            message : 'Erro ao recuperar produto: ' + err
        })
    }
}

app.route('/produtos')
   .get(getProdutos)
   .post(addProduto)
   .put(updateProduto)

app.route('/produtos/:codigo')
   .delete(deleteProduto)
   .get(getProdutoPorCodigo)


app.listen(process.env.PORT || 3002, () => {
    console.log('Servidor da API Rodando - eShop');
})