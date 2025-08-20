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

    if (!name || !answer){
      show('Você deve preencher todos os campos', 'err');
      return;
    }

    btn.disabled = true;
    const prev = btn.textContent;
    btn.textContent = 'Enviando...';

    try {
      const resp = await fetch(WEBAPP_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }, // fala com /api/rsvp (proxy da Vercel)
        body: JSON.stringify({ name, answer })
      });

      const data = await resp.json().catch(() => ({}));

      if (!resp.ok) {
        // Resposta da API com erro (500/502/…)
        show(data?.message || 'Erro ao enviar. Tente novamente.', 'err');
        return;
      }

      // Mapeia mensagens do servidor para o UI
      if (data.closed) {
        show('O prazo de confirmação esgotou', 'err');
        return;
      }

      if (!data.ok) {
        show(data.message || 'Erro ao enviar. Tente novamente.', 'err');
        return;
      }

      if (data.repeated) {
        show('Você já havia respondido. Resposta atualizada!', 'ok');
      } else if (String(answer).toLowerCase() === 'sim') {
        show('Você está confirmado(a)!', 'ok');
      } else {
        show('Que pena que você não vai', 'ok');
      }

      form.reset();

    } catch (err) {
      console.error(err);
      show('Erro ao enviar. Tente novamente.', 'err');
    } finally {
      btn.disabled = false;
      btn.textContent = prev;
    }
  });
}
