import { test, expect } from '@playwright/test';
import fs from 'fs';

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

test('export button should download all measurements as JSON', async ({ page }) => {
    await page.goto('http://localhost:1234');

    // Add some test data
    await page.evaluate(() => {
        window.bike.addPower({ timestamp: Date.now(), value: 250 });
        window.bike.addPower({ timestamp: Date.now() + 1000, value: 275 });
        window.bike.addHeartrate({ timestamp: Date.now(), value: 145 });
        window.bike.addHeartrate({ timestamp: Date.now() + 1000, value: 150 });
        window.bike.addCadence({ timestamp: Date.now(), value: 80 });
    });

    // Wait a moment for data to be added
    await page.waitForTimeout(100);

    // Set up download listener
    const downloadPromise = page.waitForEvent('download');

    // Click export button
    const exportButton = await page.locator('#exportData');
    await exportButton.click();

    // Wait for download
    const download = await downloadPromise;

    // Verify filename pattern
    const filename = download.suggestedFilename();
    expect(filename).toMatch(/bike-measurements-\d+\.json/);

    // Read the downloaded file content
    const path = await download.path();
    const fileContent = fs.readFileSync(path, 'utf-8');
    const exportedData = JSON.parse(fileContent);

    // Verify structure
    expect(exportedData).toHaveProperty('power');
    expect(exportedData).toHaveProperty('heartrate');
    expect(exportedData).toHaveProperty('cadence');

    // Verify data
    expect(exportedData.power.length).toBe(2);
    expect(exportedData.heartrate.length).toBe(2);
    expect(exportedData.cadence.length).toBe(1);

    expect(exportedData.power[0].value).toBe(250);
    expect(exportedData.heartrate[0].value).toBe(145);
    expect(exportedData.cadence[0].value).toBe(80);
});

test('cadence element should have initial value of "--"', async ({ page }) => {
    await page.goto('http://localhost:1234');

    await page.waitForTimeout(200);

    const cadenceElement = await page.locator('#cadence');
    await expect(cadenceElement).toHaveText('--');
});

test('cadence should be "--" initially, then show value 1-299 after clicking connect', async ({ page }) => {
    await page.goto('http://localhost:1234');

    await page.waitForTimeout(200);
    const cadenceElement = await page.locator('#cadence');

    // Cadence should initially be "--"
    await expect(cadenceElement).toHaveText('--');

    // Click the connect cadence button
    const connectButton = await page.locator('#connectCadence');
    await connectButton.click();

    // Wait for connection and first cadence reading
    await page.waitForTimeout(1200);

    // Get the cadence value
    const cadenceText = await cadenceElement.textContent();
    const cadenceValue = parseInt(cadenceText);

    // Verify cadence is a number between 1 and 299
    expect(cadenceValue).toBeGreaterThanOrEqual(1);
    expect(cadenceValue).toBeLessThan(300);
    expect(cadenceText).not.toBe('--');
});

test('cadence element should show "--" when data is older than 3 seconds', async ({ page }) => {
    await page.goto('http://localhost:1234');

    await page.waitForTimeout(200);
    const cadenceElement = await page.locator('#cadence');
    await expect(cadenceElement).toHaveText('--');

    // Inject old cadence data
    await page.evaluate(() => {
        const oldTimestamp = Date.now() - 4000;
        window.bike = window.bike || { cadence: [] };
        window.bike.cadence = [{ timestamp: oldTimestamp, value: 90 }];
    });

    await page.waitForTimeout(200);

    // Cadence should now show "--"
    await expect(cadenceElement).toHaveText('--');
});

test('cadence element should update from "--" to value when fresh data arrives', async ({ page }) => {
    await page.goto('http://localhost:1234');

    await page.waitForTimeout(200);
    const cadenceElement = await page.locator('#cadence');

    // Set old data
    await page.evaluate(() => {
        const oldTimestamp = Date.now() - 4000;
        window.bike.cadence = [{ timestamp: oldTimestamp, value: 80 }];
    });

    await page.waitForTimeout(200);
    await expect(cadenceElement).toHaveText('--');

    // Add fresh data
    await page.evaluate(() => {
        window.bike.cadence.push({ timestamp: Date.now(), value: 95 });
    });

    await page.waitForTimeout(200);
    await expect(cadenceElement).toHaveText('95');
});





