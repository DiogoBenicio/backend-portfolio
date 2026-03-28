# Deploy — Oracle Cloud Free Tier (ARM VM)

Guia completo para hospedar o portfólio gratuitamente na Oracle Cloud usando a VM ARM Ampere A1 (até 24 GB RAM, Free Forever).

---

## Pré-requisitos

- Conta na [Oracle Cloud](https://www.oracle.com/cloud/free/) (cartão de crédito necessário para cadastro, não é cobrado)
- Domínio próprio (opcional, mas recomendado)
- Git instalado localmente

---

## 1. Criar a conta Oracle Cloud

1. Acesse [oracle.com/cloud/free](https://www.oracle.com/cloud/free/)
2. Clique em **Start for free**
3. Preencha os dados e adicione um cartão de crédito (verificação de identidade — não cobra)
4. Selecione a **Home Region** mais próxima (ex: `Brazil East (São Paulo)`)

> **Importante:** a Home Region não pode ser alterada depois. Escolha com cuidado.

---

## 2. Criar a VM ARM

### 2.1 — Acessar Compute

No menu principal: **Compute → Instances → Create Instance**

### 2.2 — Configurar a instância

| Campo | Valor |
|---|---|
| Name | `portfolio-vm` |
| Compartment | (padrão) |
| Image | **Canonical Ubuntu 22.04** |
| Shape | **Ampere → VM.Standard.A1.Flex** |
| OCPUs | `4` |
| Memory | `24 GB` |

> O Free Tier permite até 4 OCPUs e 24 GB de RAM **total** na conta para instâncias ARM. Coloque tudo em uma única VM.

### 2.3 — Configurar rede

- **Virtual Cloud Network**: criar nova ou usar existente
- **Subnet**: pública
- **Assign public IPv4**: ✓ habilitado

### 2.4 — SSH Key

- Gere ou faça upload da sua chave pública SSH
- Salve a chave privada (`.pem`) — você vai precisar para conectar

### 2.5 — Criar

Clique em **Create**. Aguarde ~2 minutos até o status ficar `RUNNING`.

Anote o **IP público** da instância.

---

## 3. Liberar portas no Firewall da Oracle

Por padrão, a Oracle bloqueia todas as portas exceto 22. É necessário liberar as portas 80 e 443.

### 3.1 — Security List

No painel da instância: **Subnet → Security List → Add Ingress Rules**

| Source CIDR | Protocol | Port |
|---|---|---|
| `0.0.0.0/0` | TCP | `80` |
| `0.0.0.0/0` | TCP | `443` |

### 3.2 — Firewall interno da VM (após conectar via SSH)

```bash
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
sudo netfilter-persistent save
```

---

## 4. Conectar na VM via SSH

```bash
chmod 400 sua-chave.pem
ssh -i sua-chave.pem ubuntu@<IP-PUBLICO>
```

---

## 5. Instalar dependências na VM

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
newgrp docker

# Verificar instalação
docker --version
docker compose version
```

---

## 6. Configurar swap (recomendado)

Elasticsearch pode consumir muita memória em picos. Swap evita OOM kills.

```bash
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Tornar permanente
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

---

## 7. Configurar parâmetro do kernel para Elasticsearch

O Elasticsearch já está configurado no `docker-compose.yml` para consumo mínimo de memória:

| Configuração | Valor | Efeito |
|---|---|---|
| `ES_JAVA_OPTS=-Xms256m -Xmx256m` | heap fixo em 256 MB | evita expansão dinâmica |
| `-XX:+UseG1GC` | garbage collector G1 | mais eficiente em heaps pequenos |
| `-XX:G1HeapRegionSize=4m` | regiões menores no G1 | reduz fragmentação |
| `indices.memory.index_buffer_size=10%` | buffer de indexação limitado | padrão é 10%, garante o teto |
| `thread_pool.write.queue_size=100` | fila de escrita menor | reduz overhead em baixo volume |
| `mem_limit: 512m` | limite total do container | o processo Java + OS não passa de 512 MB |

Com isso, o Elasticsearch roda em ~400–500 MB de RAM total, versus os ~1 GB padrão.

> **Nota:** para workloads de produção com alto volume de dados, aumente `Xmx` para pelo menos 1 GB. Para portfólio, 256 MB é suficiente.



```bash
# Elasticsearch exige vm.max_map_count >= 262144
echo 'vm.max_map_count=262144' | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

---

## 8. Clonar o repositório

```bash
cd ~
git clone https://github.com/DiogoBenicio/backend-portfolio.git
cd backend-portfolio
```

---

## 9. Configurar variáveis de ambiente

```bash
cp .env.example .env
nano .env
```

Preencha todos os valores:

```env
OPENWEATHER_API_KEY=sua_chave_aqui
POSTGRES_PASSWORD=senha_forte_aqui
JWT_SECRET=string_aleatoria_minimo_32_chars
ADMIN_USER=seu_usuario
ADMIN_PASS=senha_forte_aqui
```

> Gere um JWT_SECRET seguro com: `openssl rand -base64 32`

---

## 10. Subir os containers

```bash
docker compose up --build -d
```

O primeiro build leva ~10 minutos (Maven baixa dependências, Next.js compila).

### Verificar status

```bash
docker compose ps
docker compose logs -f
```

Aguarde todos os containers estarem `healthy` antes de testar.

---

## 11. Testar o acesso

```bash
# Pelo próprio servidor
curl http://localhost/nginx-health

# Pela internet
curl http://<IP-PUBLICO>/nginx-health
```

O frontend estará disponível em: `http://<IP-PUBLICO>`

---

## 12. Configurar domínio (opcional)

Se você tiver um domínio, aponte um registro **A** para o IP público da VM:

```
Tipo: A
Nome: @ (ou subdomínio desejado)
Valor: <IP-PUBLICO>
TTL: 3600
```

---

## 13. Configurar HTTPS com Let's Encrypt (opcional)

Com domínio configurado, adicione TLS gratuito via Certbot.

### 13.1 — Instalar Certbot

```bash
sudo apt install certbot -y
```

### 13.2 — Parar o Nginx temporariamente

```bash
docker compose stop nginx
```

### 13.3 — Gerar certificado

```bash
sudo certbot certonly --standalone -d seudominio.com
```

Os certificados ficam em `/etc/letsencrypt/live/seudominio.com/`.

### 13.4 — Atualizar nginx.conf

Edite `nginx/nginx.conf` para adicionar o bloco HTTPS:

```nginx
server {
    listen 443 ssl;
    server_name seudominio.com;

    ssl_certificate     /etc/letsencrypt/live/seudominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/seudominio.com/privkey.pem;

    # ... restante da configuração atual
}

server {
    listen 80;
    server_name seudominio.com;
    return 301 https://$host$request_uri;
}
```

### 13.5 — Montar certificados no container Nginx

Edite `docker-compose.yml`, no serviço `nginx`, adicione:

```yaml
volumes:
  - /etc/letsencrypt:/etc/letsencrypt:ro
```

E exponha a porta 443:

```yaml
ports:
  - "80:80"
  - "443:443"
```

### 13.6 — Rebuild e subir

```bash
docker compose up --build -d nginx
```

### 13.7 — Renovação automática do certificado

```bash
# Adicionar cron para renovar antes de expirar
(crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet && docker compose -f ~/backend-portfolio/docker-compose.yml restart nginx") | crontab -
```

---

## 14. Manter containers rodando após reboot

```bash
# Habilitar Docker para iniciar com o sistema
sudo systemctl enable docker

# Adicionar restart policy (já configurado no docker-compose.yml se usar unless-stopped)
# Ou subir manualmente no reboot via cron:
(crontab -l 2>/dev/null; echo "@reboot cd ~/backend-portfolio && docker compose up -d") | crontab -
```

---

## Comandos úteis no dia a dia

```bash
# Ver status
docker compose ps

# Logs em tempo real
docker compose logs -f

# Atualizar após mudanças no código
git pull
docker compose up --build -d

# Reiniciar serviço específico
docker compose up --build -d <service-name>

# Ver uso de recursos
docker stats

# Espaço em disco
df -h
docker system df
```

---

## Resumo de custos

| Recurso | Custo |
|---|---|
| VM ARM (4 OCPUs, 24 GB RAM) | **Gratuito** |
| 200 GB de armazenamento em bloco | **Gratuito** |
| 10 TB de transferência de dados/mês | **Gratuito** |
| IP público | **Gratuito** |
| **Total** | **R$ 0,00/mês** |
