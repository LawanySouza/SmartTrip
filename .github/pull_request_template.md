## 📌 Descrição da Entrega
<!-- Resuma em 2 a 4 frases o objetivo deste Pull Request e o que foi implementado/corrigido. -->

---

## 🎯 Requisitos da SPEC Atendidos
<!-- Relacione os requisitos específicos atendidos conforme a documentação em docs/ -->
- [ ] Requisito Funcional: `RF-XXX` (ex: `RF-006` - Gestão de Períodos de Folga)
- [ ] Regra de Negócio: `RN-XXX` (ex: `RN-002` - Data de término igual ou posterior ao início)
- [ ] Seção da SPEC: [Nome da SPEC](docs/...)

---

## 🛠️ O que mudou?
<!-- Descreva brevemente as mudanças técnicas realizadas -->
- [ ] Adicionado novo componente/tela
- [ ] Implementado/atualizado serviço de persistência
- [ ] Ajustadas regras de segurança ou modelagem Firestore
- [ ] Adicionada ou atualizada suíte de testes unitários

---

## 🔒 Checklist de Segurança e Boas Práticas (Obrigatório)
- [ ] **Zero Secrets:** Confirmei que NENHUMA chave de API privada, senha ou arquivo `.env.local` está incluído no commit.
- [ ] **Escopo Único:** Este PR trata apenas desta funcionalidade específica, sem misturar alterações não relacionadas.
- [ ] **Identidade Segura:** Operações no backend utilizam a identidade da sessão (`auth.currentUser`), nunca confiando em `userId` vindo do formulário.
- [ ] **Logs Limpos:** Removi `console.log` de depuração temporários.

---

## 🧪 Evidências de Testes
<!-- Anexe os resultados dos testes executados localmente antes de abrir o PR -->
- **Lint:** `npm run lint` ➔ `[ ] PASS (Código 0)`
- **Testes Unitários:** `npm run test` ➔ `[ ] PASS (Código 0)`
- **Build de Produção:** `npm run build` ➔ `[ ] PASS (Código 0)`

### Captura de Tela / Demonstração Visual (se aplicável):
<!-- Cole aqui um print ou gravação curta demonstrando a tela ou fluxo funcionando -->

---

## 🏁 Definition of Done (DoD) para o Revisor
- [ ] Código legível e com tipagem TypeScript estrita (sem `any` desnecessário).
- [ ] Tratamento de estados visíveis: Sucesso, Carregamento (Loading) e Erro.
- [ ] Pelo menos 1 aprovação de colega de equipe registrada.
