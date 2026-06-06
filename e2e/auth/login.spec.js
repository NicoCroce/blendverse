/* global localStorage, sessionStorage */
import { expect, test } from '@playwright/test';
const successfulLoginResponse = {
  result: {
    data: {
      id: 1,
      mail: 'john@example.com',
      name: 'John',
      renewPassword: false,
      userImage: '',
      ownerId: 10,
      companyLogo: '',
      companyName: 'Acme',
      rol: 'Full Admin',
      theme: 1,
    },
  },
};
const loginErrorResponse = {
  error: {
    message: 'Contraseña incorrecta',
    code: -32001,
    data: {
      code: 'UNAUTHORIZED',
      httpStatus: 401,
      path: 'auth.login',
    },
  },
};
const usersResponse = {
  result: {
    data: {
      data: [],
      meta: {
        totalItems: 1,
        totalPages: 1,
        currentPage: 1,
        itemsPerPage: 10,
      },
    },
  },
};
const logoutResponse = {
  result: {
    data: {
      message: 'Logged out successfully',
    },
  },
};
const mockAuthRequests = async (page, invalid = false) => {
  await page.route('**/api/**', async (route) => {
    const url = route.request().url();
    if (url.includes('/api/auth.login')) {
      await route.fulfill({
        status: invalid ? 401 : 200,
        contentType: 'application/json',
        body: JSON.stringify(
          invalid ? loginErrorResponse : successfulLoginResponse,
        ),
      });
      return;
    }
    if (url.includes('/api/auth.logout')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(logoutResponse),
      });
      return;
    }
    if (url.includes('/api/users.getAll')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(usersResponse),
      });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ result: { data: null } }),
    });
  });
};
test.beforeEach(async ({ context, page }) => {
  await context.clearCookies();
  await page.addInitScript(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
});
test('allows a successful login and redirects to dashboard', async ({
  page,
}) => {
  await mockAuthRequests(page);
  await page.goto('/#/');
  await page.getByLabel('Email').fill('john@example.com');
  await page.getByLabel('Constraseña').fill('12345678');
  await page.getByRole('button', { name: 'Ingresar' }).click();
  await expect(page).toHaveURL(/#\/main$/);
  await expect(page.getByText('Bienvenido, John')).toBeVisible();
});
test('keeps the user on login and shows an error for invalid credentials', async ({
  page,
}) => {
  await mockAuthRequests(page, true);
  await page.goto('/#/');
  await page.getByLabel('Email').fill('john@example.com');
  await page.getByLabel('Constraseña').fill('87654321');
  await page.getByRole('button', { name: 'Ingresar' }).click();
  await expect(page).toHaveURL(/#\/$/);
  await expect(page.getByText('Contraseña incorrecta')).toBeVisible();
});
