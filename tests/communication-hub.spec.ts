import { test, expect } from '@playwright/test';

test.describe('Communication Hub', () => {
  test.setTimeout(60000);
  
  test.beforeEach(async ({ page }) => {
    // Capture console logs
    page.on('console', msg => console.log(`BROWSER LOG: ${msg.text()}`));

    // Mock Network Requests
    await page.route('**/api/collections/users/auth-refresh', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          token: 'mock-token',
          record: {
            id: 'owner123',
            email: 'owner@growyourneed.com',
            name: 'Owner User',
            role: 'owner',
            avatar: ''
          }
        })
      });
    });

    // Mock User Presence Update (Heartbeat)
    await page.route('**/api/collections/users/records/owner123', async route => {
      if (route.request().method() === 'PATCH') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'owner123',
            lastActive: new Date().toISOString()
          })
        });
      } else {
        await route.continue();
      }
    });

    // Mock Notifications
    await page.route('**/api/collections/notifications/records*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          page: 1,
          perPage: 20,
          totalItems: 0,
          totalPages: 1,
          items: []
        })
      });
    });

    // Mock Messages (Email View)
    await page.route('**/api/collections/messages/records*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          page: 1,
          perPage: 20,
          totalItems: 2,
          totalPages: 1,
          items: [
            { id: 'msg1', content: 'Subject: Welcome to the platform\n\nHello...', from: 'system', to: 'owner123', read: false, created: new Date().toISOString() },
            { id: 'msg2', content: 'Subject: Weekly Report\n\nHere is the report...', from: 'analytics', to: 'owner123', read: true, created: new Date().toISOString() }
          ]
        })
      });
    });

    // Mock Social Posts
    await page.route('**/api/collections/social_posts/records*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          page: 1,
          perPage: 20,
          totalItems: 1,
          totalPages: 1,
          items: [
            { id: 'post1', content: 'New feature launch!', platform: 'Twitter', status: 'published', likes: 10, shares: 5, created: new Date().toISOString() }
          ]
        })
      });
    });

    // Mock Community Posts
    await page.route('**/api/collections/posts/records*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          page: 1,
          perPage: 20,
          totalItems: 1,
          totalPages: 1,
          items: [
            { id: 'topic1', title: 'Feature Request: Dark Mode', content: 'Please add dark mode...', author: 'user1', likes: 5, tags: ['feature-request'], created: new Date().toISOString(), expand: { author: { name: 'John Doe' } } }
          ]
        })
      });
    });

    // Login as Owner
    await page.goto('/#/login');
    await page.fill('input[type="email"]', 'owner@growyourneed.com');
    await page.fill('input[type="password"]', 'Darnag123456789@');
    
    // Mock login response
    await page.route('**/api/collections/users/auth-with-password', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          token: 'mock-token',
          record: {
            id: 'owner123',
            email: 'owner@growyourneed.com',
            name: 'Owner User',
            role: 'owner'
          }
        })
      });
    });

    await page.click('button:has-text("Sign In")');
    await page.waitForURL(/.*\/admin/);
    await expect(page.locator('.animate-spin')).not.toBeVisible();
  });

  test('should load Communication Hub and display Email View', async ({ page }) => {
    await page.click('text=Communication');
    
    // Wait for module loading
    await expect(page.getByText('Initializing module...')).not.toBeVisible();

    // Check Email View Header
    await expect(page.getByText('Inbox')).toBeVisible();
    
    // Check for mocked messages
    await expect(page.getByText('Welcome to the platform')).toBeVisible();
    await expect(page.getByText('Weekly Report')).toBeVisible();
  });

  test('should navigate to Social Media View', async ({ page }) => {
    await page.click('text=Communication');
    await expect(page.getByText('Initializing module...')).not.toBeVisible();
    
    // Navigate to Social-Media tab
    await expect(page.getByRole('button', { name: 'Social-Media' }).first()).toBeVisible();
    await page.getByRole('button', { name: 'Social-Media' }).first().click();
    
    // Check Header
    await expect(page.getByText('Social Media Manager')).toBeVisible();
    
    // Check for mocked post
    await expect(page.getByText('New feature launch!')).toBeVisible();
  });

  test('should navigate to Community View', async ({ page }) => {
    await page.click('text=Communication');
    await expect(page.getByText('Initializing module...')).not.toBeVisible();
    
    // Navigate to Community tab
    await expect(page.getByRole('button', { name: 'Community' }).first()).toBeVisible();
    await page.getByRole('button', { name: 'Community' }).first().click();
    
    // Check Header
    await expect(page.getByText('Community Forums')).toBeVisible();
    
    // Check for mocked topic
    await expect(page.getByText('Feature Request: Dark Mode')).toBeVisible();
  });
});
