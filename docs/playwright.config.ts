import { defineConfig, devices } from '@playwright/test';

/**
 * Configuração do Playwright para testar páginas do VitePress
 */
export default defineConfig({
  testDir: './tests',
  
  // Executa testes em paralelo
  fullyParallel: true,
  
  // Falha se você deixar test.only no código fonte
  forbidOnly: !!process.env.CI,
  
  // Retry em CI
  retries: process.env.CI ? 2 : 0,
  
  // Workers paralelos
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter
  reporter: 'html',
  
  use: {
    // URL base para os testes
    baseURL: 'http://localhost:5173',
    
    // Timeout para ações
    actionTimeout: 10000,
    
    // Captura screenshots em falhas
    screenshot: 'only-on-failure',
    
    // Captura vídeos em falhas
    video: 'retain-on-failure',
    
    // Trace em primeira tentativa
    trace: 'on-first-retry',
  },

  // Configuração de projetos para diferentes browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Servidor de desenvolvimento
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
