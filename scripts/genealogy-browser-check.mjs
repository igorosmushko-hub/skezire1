// Playwright CLI run-code --filename scripts/genealogy-browser-check.mjs
// Requires the local production app on 3117 with the current public Neon selection.
// Browser navigation only; no publication, payments, or data mutations.
async page => {
  await page.goto('http://127.0.0.1:3117/ru/shezhire-tree');
  await page.getByRole('textbox',{name:'Найти род или ветвь'}).fill('Сіргелі');
  await page.getByRole('button',{name:'Сіргелі Қазақ',exact:true}).click();
  await page.waitForFunction(()=>new URL(location.href).searchParams.has('highlight'));
  const focus = await page.evaluate(() => new URL(location.href).searchParams.get('highlight'));
  await page.getByRole('button',{name:'KK',exact:true}).click();
  await page.waitForURL(url=>url.pathname==='/kk/shezhire-tree');
  if(await page.evaluate(() => new URL(location.href).searchParams.get('highlight'))!==focus) throw Error('locale lost focus');
  await page.reload();
  await page.getByRole('article').filter({has:page.getByRole('heading',{name:'Сіргелі',exact:true})}).waitFor();
  await page.goto('http://127.0.0.1:3117/ru/shezhire-tree?highlight=naiman#tree-explorer-title');
  await page.setViewportSize({width:375,height:812});
  await page.getByRole('button',{name:'Назад',exact:true}).click();
  await page.waitForFunction(()=>new URL(location.href).searchParams.get('highlight')==='zhuz:orta');
  if(!page.url().endsWith('#tree-explorer-title')) throw Error('hash lost');
  await page.getByRole('button',{name:'Назад',exact:true}).click();
  await page.waitForFunction(()=>new URL(location.href).searchParams.get('highlight')==='alash');
  await page.reload();
  await page.getByRole('heading',{name:'Алаш',exact:true}).first().waitFor();
  await page.setViewportSize({width:1440,height:900});
  await page.goto('http://127.0.0.1:3117/ru/shezhire-tree');
}
