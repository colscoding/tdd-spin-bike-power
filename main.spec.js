import { test, expect } from '@playwright/test';

test('power element should have initial value of "--"', async ({ page }) => {
    // Navigate to the page served by Parcel
    await page.goto('http://localhost:1234');

    // Wait for the power element to be updated
    await page.waitForTimeout(200);

    // Check that the power element has been updated to 150
    const powerElement = await page.locator('#power');
    await expect(powerElement).toHaveText('--');
});

test('power element should show "--" when data is older than 3 seconds', async ({ page }) => {
    await page.goto('http://localhost:1234');

    // Wait for initial value to be set
    await page.waitForTimeout(200);
    const powerElement = await page.locator('#power');
    await expect(powerElement).toHaveText('--');

    // Inject old power data by manipulating the bike object
    await page.evaluate(() => {
        // Access the bike object and add old power measurement
        const oldTimestamp = Date.now() - 4000; // 4 seconds old
        window.bike = window.bike || { power: [] };
        window.bike.power = [{ timestamp: oldTimestamp, value: 200 }];
    });

    // Wait for the event loop to check and update (at least 100ms)
    await page.waitForTimeout(200);

    // Power should now show "--"
    await expect(powerElement).toHaveText('--');
});

test('power element should update from "--" to value when fresh data arrives', async ({ page }) => {
    await page.goto('http://localhost:1234');

    // Wait for initial value
    await page.waitForTimeout(200);
    const powerElement = await page.locator('#power');

    // Set old data
    await page.evaluate(() => {
        const oldTimestamp = Date.now() - 4000;
        window.bike.power = [{ timestamp: oldTimestamp, value: 100 }];
    });

    // Wait for update to "--"
    await page.waitForTimeout(200);
    await expect(powerElement).toHaveText('--');

    // Add fresh data
    await page.evaluate(() => {
        window.bike.power.push({ timestamp: Date.now(), value: 250 });
    });

    // Wait for update to new value
    await page.waitForTimeout(200);
    await expect(powerElement).toHaveText('250');
});

test('power should be "--" initially, then show value 0-3000 after clicking connect', async ({ page }) => {
    await page.goto('http://localhost:1234');

    // Wait for initial load
    await page.waitForTimeout(200);
    const powerElement = await page.locator('#power');

    // Power should initially be "--"
    await expect(powerElement).toHaveText('--');

    // Click the connect button
    const connectButton = await page.locator('#connectPower');
    await connectButton.click();

    // Wait for connection and first power reading (at least 600ms to ensure data arrives)
    await page.waitForTimeout(400);

    // Get the power value
    const powerText = await powerElement.textContent();
    const powerValue = parseInt(powerText);

    // Verify power is a number between 0 and 3000
    expect(powerValue).toBeGreaterThanOrEqual(0);
    expect(powerValue).toBeLessThanOrEqual(3000);
    expect(powerText).not.toBe('--');
});

test('heartrate element should have initial value of "--"', async ({ page }) => {
    // Navigate to the page served by Parcel
    await page.goto('http://localhost:1234');

    // Wait for the heartrate element to be updated
    await page.waitForTimeout(200);

    // Check that the heartrate element displays "--"
    const heartrateElement = await page.locator('#heartrate');
    await expect(heartrateElement).toHaveText('--');
});

test('heartrate should be "--" initially, then show value 1-299 after clicking connect', async ({ page }) => {
    await page.goto('http://localhost:1234');

    // Wait for initial load
    await page.waitForTimeout(200);
    const heartrateElement = await page.locator('#heartrate');

    // Heartrate should initially be "--"
    await expect(heartrateElement).toHaveText('--');

    // Click the connect heartrate button
    const connectButton = await page.locator('#connectHeartrate');
    await connectButton.click();

    // Wait for connection and first heartrate reading (at least 1100ms to ensure data arrives)
    await page.waitForTimeout(1200);

    // Get the heartrate value
    const heartrateText = await heartrateElement.textContent();
    const heartrateValue = parseInt(heartrateText);

    // Verify heartrate is a number between 1 and 299
    expect(heartrateValue).toBeGreaterThanOrEqual(1);
    expect(heartrateValue).toBeLessThan(300);
    expect(heartrateText).not.toBe('--');
});

test('heartrate element should show "--" when data is older than 3 seconds', async ({ page }) => {
    await page.goto('http://localhost:1234');

    // Wait for initial value to be set
    await page.waitForTimeout(200);
    const heartrateElement = await page.locator('#heartrate');
    await expect(heartrateElement).toHaveText('--');

    // Inject old heartrate data by manipulating the bike object
    await page.evaluate(() => {
        // Access the bike object and add old heartrate measurement
        const oldTimestamp = Date.now() - 4000; // 4 seconds old
        window.bike = window.bike || { heartrate: [] };
        window.bike.heartrate = [{ timestamp: oldTimestamp, value: 150 }];
    });

    // Wait for the event loop to check and update (at least 100ms)
    await page.waitForTimeout(200);

    // Heartrate should now show "--"
    await expect(heartrateElement).toHaveText('--');
});

test('heartrate element should update from "--" to value when fresh data arrives', async ({ page }) => {
    await page.goto('http://localhost:1234');

    // Wait for initial value
    await page.waitForTimeout(200);
    const heartrateElement = await page.locator('#heartrate');

    // Set old data
    await page.evaluate(() => {
        const oldTimestamp = Date.now() - 4000;
        window.bike.heartrate = [{ timestamp: oldTimestamp, value: 120 }];
    });

    // Wait for update to "--"
    await page.waitForTimeout(200);
    await expect(heartrateElement).toHaveText('--');

    // Add fresh data
    await page.evaluate(() => {
        window.bike.heartrate.push({ timestamp: Date.now(), value: 165 });
    });

    // Wait for update to new value
    await page.waitForTimeout(200);
    await expect(heartrateElement).toHaveText('165');
});




