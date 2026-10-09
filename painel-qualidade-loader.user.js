// ==UserScript==
// @name         WMS - Painel Qualidade - Loader
// @namespace    qc-wms-br.loader
// @version      1.0.5
// @description  Loader central do Painel Qualidade - instala uma vez e atualiza automaticamente
// @author       Lucas Echer
// @match        https://wms.ssc.shopee.com.br/*
// @run-at       document-idle
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @grant        GM_addStyle
// @connect      drive.google.com
// @connect      drive.usercontent.google.com
// @connect      googleusercontent.com
// @connect      script.google.com
// @connect      script.googleusercontent.com
// @updateURL    https://raw.githubusercontent.com/LucasEcher-ops/Painel-Qualidade/main/painel-qualidade-loader.user.js
// @downloadURL  https://raw.githubusercontent.com/LucasEcher-ops/Painel-Qualidade/main/painel-qualidade-loader.user.js
// ==/UserScript==

(async function () {
  'use strict';

  const CENTRAL_URL = 'https://drive.google.com/uc?export=download&id=1PNNjjNGAK7PHt7S5Mq0xhXgCMiNWqIQr';
  const CACHE_KEY = 'qc_panel_central_cache_v1';

  function baixarCentral() {
    return new Promise((resolve, reject) => {
      GM_xmlhttpRequest({
        method: 'GET',
        url: CENTRAL_URL + '&_=' + Date.now(),
        timeout: 60000,
        headers: { Accept: 'text/plain,*/*' },
        onload: (response) => {
          const code = String(response.responseText || '').trim();
          if (response.status >= 200 && response.status < 400 && code.includes('WMS - Painel Qualidade')) {
            resolve(code);
          } else {
            reject(new Error('Central respondeu sem um script válido (HTTP ' + response.status + ').'));
          }
        },
        onerror: () => reject(new Error('Falha de rede ao baixar a Central.')),
        ontimeout: () => reject(new Error('Timeout ao baixar a Central.'))
      });
    });
  }

  function executar(code) {
    new Function(
      'GM_xmlhttpRequest',
      'GM_getValue',
      'GM_setValue',
      'GM_deleteValue',
      'GM_addStyle',
      code
    )(GM_xmlhttpRequest, GM_getValue, GM_setValue, GM_deleteValue, GM_addStyle);
  }

  try {
    const code = await baixarCentral();
    GM_setValue(CACHE_KEY, code);
    executar(code);
  } catch (error) {
    const cached = String(GM_getValue(CACHE_KEY, '') || '');
    if (cached) {
      console.warn('[Painel Qualidade Loader] Central indisponível; usando cache.', error);
      executar(cached);
    } else {
      console.error('[Painel Qualidade Loader] Não foi possível iniciar o painel.', error);
    }
  }
})();
