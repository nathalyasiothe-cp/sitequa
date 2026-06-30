document.addEventListener('DOMContentLoaded', function () {
  
  // Inicializando os Modais do Bootstrap (Se eles existirem na página)
  const elModalErro = document.getElementById('modalErro');
  const elModalSucesso = document.getElementById('modalSucesso');
  
  const modalErro = elModalErro ? new bootstrap.Modal(elModalErro) : null;
  const modalSucesso = elModalSucesso ? new bootstrap.Modal(elModalSucesso) : null;
  const textoErro = document.getElementById('modalErroMensagem');

  // Fechar o menu colapsável ao clicar em um link (Comum a ambas as páginas)
  const navLinks = document.querySelectorAll('#navbarToggleExternalContent .nav-link');
  const collapseEl = document.getElementById('navbarToggleExternalContent');
  navLinks.forEach(link => {
    link.addEventListener('click', function () {
      if (collapseEl) {
        const bsCollapse = bootstrap.Collapse.getInstance(collapseEl);
        if (bsCollapse) bsCollapse.hide();
      }
    });
  });

  // Botão do modal de sucesso que joga para o topo (Mantenha se mantiver o ID antigo no modal)
  const btnSucessoInicio = document.getElementById('btn-sucesso-inicio');
  if (btnSucessoInicio) {
    btnSucessoInicio.addEventListener('click', function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---- Helpers de Validação ---- */
  function mostrarErro(msg) {
    if (textoErro && modalErro) {
      textoErro.textContent = msg;
      modalErro.show();
    } else {
      alert(msg); // Fallback caso o modal não exista na página atual
    }
  }

  // Corrigido sutilmente o Regex de e-mail para evitar falhas em domínios longos
  function validarEmail(e) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  }

  function validarCPF(cpf) {
    cpf = cpf.replace(/\D/g, '');
    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
    let s = 0, r;
    for (let i = 1; i <= 9; i++) s += parseInt(cpf[i-1]) * (11-i);
    r = (s * 10) % 11; if (r === 10 || r === 11) r = 0;
    if (r !== parseInt(cpf[9])) return false;
    s = 0;
    for (let i = 1; i <= 10; i++) s += parseInt(cpf[i-1]) * (12-i);
    r = (s * 10) % 11; if (r === 10 || r === 11) r = 0;
    return r === parseInt(cpf[10]);
  }

  function validarData(data) {
    var p = data.split('/');
    if (p.length !== 3) return false;
    var d = parseInt(p[0]), m = parseInt(p[1]), a = parseInt(p[2]);
    if (isNaN(d) || isNaN(m) || isNaN(a) || m < 1 || m > 12 || d < 1 || d > 31) return false;
    var hoje = new Date(), nasc = new Date(a, m-1, d);
    if (nasc > hoje) return false;
    var idade = hoje.getFullYear() - nasc.getFullYear();
    var dm = hoje.getMonth() - nasc.getMonth();
    if (dm < 0 || (dm === 0 && hoje.getDate() < nasc.getDate())) idade--;
    return idade >= 18;
  }

  function avaliarSenha(s) {
    var f = 0;
    if (s.length >= 8) f++;
    if (/[A-Z]/.test(s)) f++;
    if (/[0-9]/.test(s)) f++;
    if (/[^A-Za-z0-9]/.test(s)) f++;
    return f;
  }

  /* ---- BLOCO PROTEGIDO: Só roda se estiver na página de cadastro ---- */
  const formCadastro = document.getElementById('form-cadastro');
  if (formCadastro) {

    // Máscaras Dinâmicas
    document.getElementById('cpf').addEventListener('input', function (e) {
      var v = e.target.value.replace(/\D/g, '').substring(0, 11);
      v = v.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2');
      e.target.value = v;
    });

    document.getElementById('telefone').addEventListener('input', function (e) {
      var v = e.target.value.replace(/\D/g, '').substring(0, 11);
      v = v.length <= 10 
        ? v.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d)/, '$1-$2') 
        : v.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2');
      e.target.value = v;
    });

    document.getElementById('nascimento').addEventListener('input', function (e) {
      var v = e.target.value.replace(/\D/g, '').substring(0, 8);
      v = v.replace(/(\d{2})(\d)/, '$1/$2').replace(/(\d{2})(\d)/, '$1/$2');
      e.target.value = v;
    });

    // Força da Senha
    document.getElementById('senha').addEventListener('input', function (e) {
      var s = e.target.value, f = avaliarSenha(s);
      var cores = ['', 'bg-danger', 'bg-warning', 'bg-info', 'bg-success'];
      var labels = ['', 'Fraca ❌', 'Razoável ⚠️', 'Boa 👍', 'Forte 🔥'];
      var larg = ['0%', '25%', '50%', '75%', '100%'];
      
      var barra = document.getElementById('barra-forca');
      var label = document.getElementById('label-forca');
      
      if (barra) barra.className = 'progress-bar'; 
      if (s.length === 0) {
        if (barra) barra.style.width = '0%';
        if (label) label.textContent = '';
      } else {
        if (barra) {
          barra.style.width = larg[f];
          barra.classList.add(cores[f]);
        }
        if (label) label.textContent = labels[f];
      }
    });

    document.getElementById('btn-toggle-senha').addEventListener('click', function () {
      var inp = document.getElementById('senha');
      if (inp.getAttribute('type') === 'password') {
        inp.setAttribute('type', 'text');
        this.textContent = '🙈';
      } else {
        inp.setAttribute('type', 'password');
        this.textContent = '👁';
      }
    });

    // Submissão do Formulário
    formCadastro.addEventListener('submit', function (e) {
      e.preventDefault();
      
      var nome = document.getElementById('nome').value.trim();
      var email = document.getElementById('email').value.trim();
      var cpf = document.getElementById('cpf').value;
      var tel = document.getElementById('telefone').value.replace(/\D/g, '');
      var nasc = document.getElementById('nascimento').value.trim();
      var plano = document.getElementById('plano').value;
      
      var freqRadio = document.querySelector('input[name="frequencia"]:checked');
      var freq = freqRadio ? freqRadio.value : null;
      
      var senha = document.getElementById('senha').value;
      var conf = document.getElementById('confirma-senha').value;
      var termos = document.getElementById('termos').checked;

      if (nome.length < 3 || !/\s/.test(nome)) { mostrarErro('Informe seu nome completo (nome e sobrenome).'); return; }
      if (!validarEmail(email)) { mostrarErro('O e-mail informado não é válido.'); return; }
      if (!validarCPF(cpf)) { mostrarErro('O CPF informado é inválido.'); return; }
      if (tel.length < 10 || tel.length > 11) { mostrarErro('Informe um telefone válido com DDD.'); return; }
      if (nasc.length !== 10 || !validarData(nasc)) { mostrarErro('Data inválida ou menor de 18 anos.'); return; }
      if (!plano) { mostrarErro('Selecione um plano de assinatura.'); return; }
      if (!freq) { mostrarErro('Escolha a frequência de entrega.'); return; }
      if (senha.length < 8 || avaliarSenha(senha) < 2) { mostrarErro('Sua senha deve ter no mínimo 8 caracteres e uma força aceitável.'); return; }
      if (senha !== conf) { mostrarErro('As senhas não coincidem.'); return; }
      if (!termos) { mostrarErro('Você precisa aceitar os Termos de Uso.'); return; }

      // 🌟 ADICIONADO AQUI: Guarda a escolha do usuário na memória local antes do reset
      localStorage.setItem('planoEscolhido', plano);
      localStorage.setItem('frequenciaEscolhida', freq);

      this.reset();
      const barraForca = document.getElementById('barra-forca');
      const labelForca = document.getElementById('label-forca');
      if (barraForca) barraForca.style.width = '0%';
      if (labelForca) labelForca.textContent = '';
      
      if (modalSucesso) modalSucesso.show();
    });
  }

  /* ---- BLOCO PROTEGIDO: Newsletter (Só roda se estiver no index.html) ---- */
  const btnNewsletter = document.getElementById('btn-newsletter');
  if (btnNewsletter) {
    btnNewsletter.addEventListener('click', function () {
      var emailInput = document.getElementById('nl-email');
      var email = emailInput.value.trim();
      if (!validarEmail(email)) { mostrarErro('Informe um e-mail válido para assinar.'); return; }
      
      mostrarErro('✅ Cadastrado com sucesso na newsletter!');
      emailInput.value = '';
    });
  }
  
});