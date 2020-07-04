const cheerio = require('cheerio');
const fs = require('fs');
const rp = require('request-promise');
var Promise = require("bluebird");

const promo_url = "https://www.bankmega.com/ajax.promolainnya.php";
const url_object = new URL(promo_url);
let promo_list = {};

async function generateJSON() {
    let product = 0;
    let subcat = 1;
    let page = 1;
    let subcat_complete = false;
    let page_complete = false;
    let scrapper_complete = false;

    while (scrapper_complete == false) {
        let url_to_load = promo_url + "?product=" + product + "&subcat=" + subcat + "&page=" + page;
        console.log('scrapping: ' + url_to_load);
        await rp(url_to_load)
            .then(async function (html) {
                const $ = cheerio.load(html);
                let subcat_title = $('#subcatselected img').attr('title');
                let list = $('ul#promolain li');
                $(list).each(async function (i, li) {
                    let detail_url = url_object.origin + '/' + $('a', li).attr('href');
                    let promo_title = $('img', li).attr('title');
                    let promo_img_url = url_object.origin + '/' + $('img', li).attr('src');
                    const detail_url_object = new URL(detail_url);
                    let promo_id = detail_url_object.searchParams.get('id');
                    let subcat = promo_list[subcat_title];
                    if (subcat === undefined) {
                        promo_list[subcat_title] = [{ title: promo_title, imageurl: promo_img_url, detailurl: detail_url, id: promo_id }];
                    }
                    else {
                        promo_list[subcat_title].push({ title: promo_title, imageurl: promo_img_url, detailurl: detail_url, id: promo_id });
                    }
                });
                if (promo_list[subcat_title] != undefined) {
                    await Promise.all(promo_list[subcat_title].map(async (promo) => {
                        console.log('scrapping: ' + promo.detailurl);
                        await rp(promo.detailurl)
                            .then(async function (detail_html) {
                                const detail_dom = cheerio.load(detail_html);
                                let area_promo = detail_dom('.area b').html();
                                let periode_promo_text = "";
                                let periode_promo = detail_dom('.periode b');
                                $(periode_promo).each(async function (i, b) {
                                    periode_promo_text += detail_dom(b).html();
                                });
                                let detail_image_url = url_object.origin + detail_dom('.keteranganinside img').attr('src');
                                promo.area = area_promo;
                                promo.periode = periode_promo_text;
                                promo.detailimageurl = detail_image_url;
                            })
                            .catch(function (err) {
                                console.log(err);
                            });
                    }));
                }
                if (list.length <= 0) {
                    if (page <= 1) {
                        subcat_complete = true;
                    }
                    else {
                        page_complete = true;
                        page = 1;
                        subcat++;
                    }
                }
                else {
                    page_complete = false;
                    subcat_complete = false;
                    page++;
                }
                scrapper_complete = page_complete && subcat_complete;
            })
            .catch(function (err) {
                console.log(err);
                page_complete = true;
                subcat_complete = true;
                throw "web is down!";
            });
    }
    const json = JSON.stringify(promo_list);
    await fs.writeFileSync('solution.json', json);
}

(async () => {
    try {
        await generateJSON();
        console.log("Scrapper is done! solution.json file was generated successfully!");
    } catch (error) {
        console.log(error);
    }
})();