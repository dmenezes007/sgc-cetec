import pandas as pd
from sqlalchemy import create_engine
from thefuzz import fuzz
from collections import defaultdict

# --- 1. CONFIGURAÇÃO ---
# Cole sua String de Conexão do Neon aqui
# Você a encontra no painel do Neon (Ex: postgresql://user:pass@host.neon.tech/dbname?sslmode=require)
NEON_CONNECTION_STRING = "postgresql://neondb_owner:npg_dGxg3yrs5Yeh@ep-crimson-shape-adtw7y6x-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

TABLE_NAME = "capacitacoes"
COLUMNS_TO_CLEAN = [
    "servidor",
    "instituicao_promotora",
    "cnpjcpf",
    "modalidade",
    "linha_de_capacitacao",
    "programa_interno_cetec",
    "com_ou_sem_afastamento",
    "mes",
    "iniciativa",
    "devolutiva_pdp",
    "gratuito_ou_pago"
]
# O seu percentual de 70%
SIMILARITY_THRESHOLD = 70

# --- 2. LÓGICA DE AGRUPAMENTO (CLUSTERING) ---
def find_clusters(terms_df, threshold):
    """
    Agrupa termos similares.
    Itera sobre os termos e cria "clusters" de termos com similaridade
    acima do 'threshold' usando token_set_ratio.
    """
    # Converte o DataFrame para uma lista de tuplas (termo, contagem)
    terms_counts = list(zip(terms_df['term'], terms_df['count']))
    clusters = []
    processed_terms = set()

    for term, count in terms_counts:
        if term in processed_terms or term is None:
            continue

        # Começa um novo cluster com o termo atual
        current_cluster = {term}
        processed_terms.add(term)

        # Compara com todos os outros termos
        for other_term, other_count in terms_counts:
            if other_term not in processed_terms and other_term is not None:
                
                # Usa token_set_ratio para lidar bem com abreviações
                # (Ex: "Instituto Nacional" vs "Instit. Nacional")
                score = fuzz.token_set_ratio(term, other_term)
                
                if score >= threshold:
                    current_cluster.add(other_term)
                    processed_terms.add(other_term)
        
        if len(current_cluster) > 1:
            clusters.append(current_cluster)
            
    return clusters

def generate_update_map(clusters, terms_df):
    """
    Cria um mapa de {'termo_ruim': 'termo_padrao'}.
    O 'termo_padrao' é o mais frequente do cluster.
    """
    update_map = {}
    
    # Cria um dicionário de 'termo': contagem
    terms_with_counts = terms_df.set_index('term')['count'].to_dict()

    for cluster in clusters:
        if not cluster:
            continue

        # Encontra o termo mais frequente no cluster para ser o padrão
        most_frequent_term = max(cluster, key=lambda t: terms_with_counts.get(t, 0))

        # Cria o mapa de correção
        for term in cluster:
            if term != most_frequent_term:
                update_map[term] = most_frequent_term
                
    return update_map

def generate_sql_update(table_name, column_name, update_map):
    """
    Gera o comando SQL 'UPDATE ... CASE ...' completo.
    """
    if not update_map:
        return None

    sql_comment = f"-- Correções para a coluna: {column_name}\n"
    sql_update = f"UPDATE {table_name}\n"
    sql_set = f"SET {column_name} = CASE {column_name}\n"
    sql_where_list = []

    for old_val, new_val in update_map.items():
        # Prepara os valores para SQL (escapa apóstrofos)
        old_val_sql = old_val.replace("'", "''")
        new_val_sql = new_val.replace("'", "''")
        
        sql_set += f"    WHEN '{old_val_sql}' THEN '{new_val_sql}'\n"
        sql_where_list.append(f"'{old_val_sql}'")

    sql_set += f"    ELSE {column_name}\nEND\n"
    sql_where = f"WHERE {column_name} IN ({', '.join(sql_where_list)});"
    
    return sql_comment + sql_update + sql_set + sql_where

# --- 3. FUNÇÃO PRINCIPAL ---
def main():
    print("--- Iniciando Script de Padronização de Dados ---")
    
    if NEON_CONNECTION_STRING == "SUA_STRING_DE_CONEXAO_DO_NEON_AQUI":
        print("ERRO: Por favor, edite o script e adicione sua String de Conexão do Neon.")
        return

    try:
        engine = create_engine(NEON_CONNECTION_STRING)
        conn = engine.connect()
        print("Conexão com o banco de dados Neon (PostgreSQL) estabelecida com sucesso.")
    except Exception as e:
        print(f"ERRO: Não foi possível conectar ao banco de dados: {e}")
        return

    final_sql_script = []
    final_sql_script.append("-- SCRIPT DE ATUALIZAÇÃO GERADO PELO PYTHON")
    final_sql_script.append("-- Execute este script no DBeaver com Auto-Commit DESLIGADO.")
    final_sql_script.append("-- Revise as alterações e use 'Commit' ou 'Rollback'.\n")

    for column in COLUMNS_TO_CLEAN:
        print(f"\n--- Processando coluna: {column} ---")
        
        try:
            # 1. Busca termos únicos e suas contagens
            query = f"SELECT {column} as term, COUNT(*) as count FROM {TABLE_NAME} WHERE {column} IS NOT NULL GROUP BY {column}"
            terms_df = pd.read_sql(query, conn)
            
            if terms_df.empty:
                print("Coluna vazia ou sem dados. Pulando.")
                continue

            # 2. Encontra os clusters de termos similares
            clusters = find_clusters(terms_df, SIMILARITY_THRESHOLD)
            
            if not clusters:
                print("Nenhum grupo de termos similares encontrado.")
                continue
                
            # 3. Gera o mapa de correção (Ex: 'ead' -> 'EAD')
            update_map = generate_update_map(clusters, terms_df)

            if not update_map:
                print("Grupos encontrados, mas nenhuma correção necessária (ex: grupos de 1).")
                continue
            
            print(f"Correções sugeridas ({len(update_map)}):")
            for k, v in update_map.items():
                print(f"  '{k}' -> '{v}'")

            # 4. Gera o script SQL para estas correções
            sql_update_command = generate_sql_update(TABLE_NAME, column, update_map)
            if sql_update_command:
                final_sql_script.append(sql_update_command)

        except Exception as e:
            print(f"ERRO ao processar a coluna '{column}'. É uma coluna de texto? Erro: {e}")
            print("Pulando para a próxima coluna.")

    conn.close()

    # --- 4. EXIBE O SCRIPT SQL FINAL ---
    print("\n\n" + "="*50)
    print("SCRIPT SQL FINAL GERADO")
    print("="*50)
    
    if len(final_sql_script) > 3:
        final_output = "\n\n".join(final_sql_script)
        print(final_output)
        
        # Opcional: Salvar em um arquivo
        with open("update_script.sql", "w", encoding="utf-8") as f:
            f.write(final_output)
        print("\n\nScript também salvo como 'update_script.sql' no mesmo diretório.")
        
    else:
        print("Nenhuma correção de dados foi necessária em nenhuma coluna.")

    print("--- Processo Concluído ---")


if __name__ == "__main__":
    main()