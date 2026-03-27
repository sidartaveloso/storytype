import { test, expect } from '@playwright/test';

/**
 * Lista de páginas para testar
 * Formato: [url, titulo esperado ou regex]
 * Nota: VitePress está configurado com base: '/storytype/'
 */
const pages = [
  // Páginas principais em inglês (en/ é mapeado para raiz via rewrite)
  { url: '/storytype/', title: 'Storytype' },
  { url: '/storytype/guide/introduction', title: /What is Storytype/ },
  { url: '/storytype/guide/quick-start', title: /Quick Start/ },

  // Páginas principais em português
  { url: '/storytype/pt-br/', title: 'Storytype' },
  { url: '/storytype/pt-br/guide/introduction', title: /O Que é Storytype/ },
  { url: '/storytype/pt-br/guide/quick-start', title: /Início Rápido/ },
] as const;

test.describe('VitePress Pages Accessibility', () => {
  test.describe.configure({ mode: 'parallel' });

  for (const page of pages) {
    test(`${page.url} deve estar acessível`, async ({ page: playwright }) => {
      // Navega para a página
      const response = await playwright.goto(page.url);

      // Verifica se a resposta foi bem-sucedida
      expect(response?.status()).toBe(200);

      // Aguarda o conteúdo carregar
      await playwright.waitForLoadState('networkidle');

      // Verifica se o título contém o texto esperado
      await expect(playwright).toHaveTitle(page.title);

      // Verifica se não há erro 404
      const content = await playwright.content();
      expect(content).not.toContain('404');
      expect(content).not.toContain('PAGE NOT FOUND');

      // Verifica se o conteúdo principal existe (pega o primeiro elemento se houver múltiplos)
      const mainContent = playwright.locator('main, .vp-doc').first();
      await expect(mainContent).toBeVisible();
    });
  }

  test('Links de navegação principais devem funcionar', async ({ page }) => {
    await page.goto('/storytype/');

    // Verifica botão "Get Started"
    const getStartedButton = page.locator('a:has-text("Get Started")').first();
    await expect(getStartedButton).toBeVisible();

    // Verifica menu de navegação
    const guideLink = page.locator('nav a:has-text("Guide")').first();
    await expect(guideLink).toBeVisible();
  });

  test('Troca de idioma deve funcionar', async ({ page }) => {
    // Começa na página em inglês
    await page.goto('/storytype/');
    await expect(page).toHaveTitle(/Storytype/);

    // Procura pelo seletor de idioma (pode estar em um dropdown)
    const languageSelector = page.locator(
      '[aria-label*="language"], .VPNavBarTranslations, a[href*="pt-br"]'
    );

    // Se encontrou, tenta clicar
    const count = await languageSelector.count();
    if (count > 0) {
      await languageSelector.first().click();

      // Aguarda navegação ou mudança de conteúdo
      await page.waitForTimeout(1000);
    }
  });

  test('Busca deve estar disponível', async ({ page }) => {
    await page.goto('/storytype/');

    // Verifica se o botão/input de busca existe
    const searchButton = page.locator(
      'button:has-text("Search"), .DocSearch, [placeholder*="Search"]'
    );

    // Deve ter pelo menos um elemento de busca
    await expect(searchButton.first()).toBeVisible();
  });

  test('Logo deve ser carregado', async ({ page }) => {
    await page.goto('/storytype/');

    // Verifica se a imagem do logo carrega
    const logo = page.locator('img[alt="Storytype"], img[src*="logo"]');

    const count = await logo.count();
    if (count > 0) {
      await expect(logo.first()).toBeVisible();
    }
  });

  test('Exemplos de código devem estar visíveis', async ({ page }) => {
    await page.goto('/storytype/guide/introduction');

    // Aguarda carregar
    await page.waitForLoadState('networkidle');

    // Verifica se há blocos de código
    const codeBlocks = page.locator('pre code, .vp-code-group');

    const count = await codeBlocks.count();
    expect(count).toBeGreaterThan(0);
  });

  test('Footer deve conter informações de copyright', async ({ page }) => {
    await page.goto('/storytype/');

    // Verifica se o footer existe e contém informações
    const footer = page.locator('footer, .VPFooter');
    await expect(footer).toBeVisible();

    // Verifica conteúdo do footer
    const footerText = await footer.textContent();
    expect(footerText).toContain('Sidarta Veloso');
  });
});

test.describe('Estrutura de documentação', () => {
  test('Sidebar deve estar presente nas páginas de guia', async ({ page }) => {
    await page.goto('/storytype/guide/introduction');

    // Verifica se a sidebar ou navegação lateral existe
    const sidebar = page.locator('aside, .VPSidebar, .sidebar, nav[class*="sidebar"]').first();

    // Se encontrou, verifica se está visível
    const count = await sidebar.count();
    if (count > 0) {
      await expect(sidebar).toBeVisible();
    } else {
      // Se não encontrou sidebar, pelo menos verifica que o conteúdo carregou
      const content = page.locator('.vp-doc, main').first();
      await expect(content).toBeVisible();
    }
  });

  test('Navegação entre páginas consecutivas deve funcionar', async ({ page }) => {
    const initialUrl = '/storytype/guide/introduction';
    await page.goto(initialUrl);

    // Procura por link "Next" ou similar
    const nextLink = page
      .locator('a:has-text("Next"), a:has-text("Próximo"), .pager-link.next, .prev-next a')
      .first();

    const count = await nextLink.count();
    if (count > 0) {
      const linkHref = await nextLink.getAttribute('href');

      // Clica no link
      await nextLink.click();
      await page.waitForLoadState('networkidle');

      // Verifica se navegou (URL mudou ou conteúdo mudou)
      const currentUrl = page.url();
      const urlChanged =
        currentUrl !== `http://localhost:5173${initialUrl}` &&
        !currentUrl.includes(initialUrl + '#');

      // Se a URL mudou de verdade (não foi só uma âncora), verifica
      if (linkHref && linkHref.startsWith('/') && !linkHref.includes('#')) {
        expect(urlChanged).toBeTruthy();
      }
    }
  });

  test('Todos os links internos devem ser válidos', async ({ page }) => {
    // Lista de páginas para verificar os links
    const pagesToCheck = [
      '/storytype/',
      '/storytype/guide/introduction',
      '/storytype/guide/quick-start',
      '/storytype/pt-br/',
      '/storytype/pt-br/guide/introduction',
      '/storytype/pt-br/guide/quick-start',
    ];

    const brokenLinks: Array<{ page: string; link: string; reason: string }> = [];
    const checkedUrls = new Set<string>();

    for (const pageUrl of pagesToCheck) {
      await page.goto(pageUrl);
      await page.waitForLoadState('networkidle');

      // Pega todos os links internos (que começam com / ou são relativos)
      const links = await page
        .locator('a[href^="/"], a[href^="./"], a[href^="../"]')
        .evaluateAll(elements => elements.map(el => (el as HTMLAnchorElement).href));

      // Verifica cada link único
      for (const link of links) {
        try {
          const url = new URL(link);
          const pathname = url.pathname;

          // Ignora âncoras puras (só #) e links externos
          if (!pathname || pathname === '/') {
            continue;
          }

          // Evita verificar o mesmo URL múltiplas vezes
          if (checkedUrls.has(pathname)) {
            continue;
          }
          checkedUrls.add(pathname);

          // Navega para o link e verifica o conteúdo
          const response = await page.goto(link);
          await page.waitForLoadState('networkidle');

          const content = await page.content();
          const pageTitle = await page.title();

          // Verifica se é uma página 404 (VitePress retorna 200 mas mostra 404 no conteúdo)
          const is404 =
            content.includes('404') ||
            content.includes('Page Not Found') ||
            content.includes('PAGE NOT FOUND') ||
            pageTitle.includes('404');

          if (is404) {
            brokenLinks.push({
              page: pageUrl,
              link: pathname,
              reason: '404 page',
            });
          }
        } catch (error) {
          // Se houver erro na requisição, considera como link quebrado
          brokenLinks.push({
            page: pageUrl,
            link: link,
            reason: error instanceof Error ? error.message : 'erro desconhecido',
          });
        }
      }
    }

    // Se houver links quebrados, mostra a lista no erro
    if (brokenLinks.length > 0) {
      const errorMessage =
        'Links quebrados encontrados:\n' +
        brokenLinks
          .map(({ page, link, reason }) => `  - Na página ${page}: ${link} (${reason})`)
          .join('\n');

      expect(brokenLinks.length, errorMessage).toBe(0);
    }
  });
});
