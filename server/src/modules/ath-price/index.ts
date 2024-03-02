import path from 'path'
import puppeteer from 'puppeteer'
import { getDirname, writeFile } from 'src/utils/fs';
import converter from 'json-2-csv';

const browser = await puppeteer.launch({ headless: false });
const page = await browser.newPage();


const collectPage = async (pageNumber: number = 0) => {
    await page.goto(`https://coingolive.com/en/coin/ath-price/?p=${pageNumber}`);

    const tableHandler = await page.$('table tbody');
    
    return page.evaluate((tableBody) => {
        const rows = Array.from(tableBody?.querySelectorAll('tr') ?? []);
        if (!rows.length) {
            return null;
        }
        return rows.map((row) => {
            const columns = Array.from(row.querySelectorAll('td'));
            const [{}, tank, coinInfo, {}, allTimeHigh, {}, {}, priceDropSinceATH, volume24] = columns;
                const id = tank.innerHTML?.trim()
                const coinName = coinInfo.querySelector('.coin-link')?.innerHTML;
                const allTimeHighValue = (allTimeHigh?.innerHTML?.replace('$', '')?.replace(',', '')?.replace('.', ''));
                const priceDropSinceATHValue = (priceDropSinceATH.querySelector('.progress-bar')?.innerHTML?.trim()?.replace('%', ''))
                const volume24Value = (volume24.querySelector('span')?.innerHTML?.trim()?.replace('$', '')?.replace('.', ''))
                return {
                    rank: id,
                    symbol: coinName,
                    allTimeHigh: Number(allTimeHighValue),
                    priceDropSinceATH: Number(priceDropSinceATHValue),
                    volume24: (volume24Value)
                }
        })
    }, tableHandler);
}


let results = [];
let pageNumber = 0;
let tempData;
do {
    console.log('starting to fetch the page ' + pageNumber);
    
    tempData = await collectPage(pageNumber);
    if (tempData) {
        results.push(...tempData);
        writeFile(path.resolve(getDirname(import.meta.url), './ath.data.json'), JSON.stringify(results));
        const csv = converter.json2csv(results)
        writeFile(path.resolve(getDirname(import.meta.url), './ath.data.csv'), csv);
        pageNumber = pageNumber + 1;
    }
} while (tempData !== null);

console.log('Done');
