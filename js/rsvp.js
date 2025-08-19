// js/rsvp.js
import { WEBAPP_URL } from './config.js';

export function initRsvp(formId, messageId, buttonId){
  const form = document.getElementById(formId);
  if (!form) return;

  const box = document.getElementById(messageId);
  const btn = document.getElementById(buttonId);

  const show = (text, type='err') => {
    box.textContent = text;
    box.className = 'msg measure ' + (type === 'ok' ? 'ok' : 'err');
    box.style.display = 'block';
  };
  const clear = () => { box.style.display = 'none'; box.textContent = ''; };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clear();

    const name = form.querySelector('#name')?.value.trim() || '';
    const answer = form.querySelector('input[name="answer"]:checked')?.value || '';

    // Verificação única: ambos preenchidos
    if (!name || !answer){
      show('Você deve preencher os dois campos', 'err');
      return;
    }

    btn.disabled = true;
    const prev = btn.textContent;
    btn.textContent = 'Enviando...';

    try {
      const resp = await fetch(WEBAPP_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // evita preflight
        body: JSON.stringify({ name, answer })
      });

      const text = await resp.text();
      let data;
      try { data = JSON.parse(text); }
      catch { show('Erro ao enviar. Verifique o deploy do Apps Script.', 'err'); return; }

      if (!resp.ok) {
        show('Erro ao enviar. Tente novamente.', 'err');
        return;
      }

      if (data.closed) {
        show(data.message || 'Prazo de resposta esgotado', 'err');
        return;
      }

      if (data.ok) {
        // Mensagem de sucesso vinda do servidor (já personalizada p/ Sim/Não)
        show(data.message || 'Resposta registrada com sucesso!', 'ok');
        form.reset();
      } else {
        // Falha de validação (ex.: campos vazios)
        show(data.message || 'Erro ao enviar. Tente novamente.', 'err');
      }

    } catch (err) {
      show('Erro ao enviar. Verifique o deploy do Apps Script.', 'err');
    } finally {
      btn.disabled = false;
      btn.textContent = prev;
    }
  });
}
