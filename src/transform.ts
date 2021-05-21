import cheerio from 'cheerio'
import Response from '@layer0/core/router/Response'
import Request from '@layer0/core/router/Request'
import { injectBrowserScript } from '@layer0/starter'

export default function transform(response: Response, request: Request) {
  // inject browser.ts into the document returned from the origin
  injectBrowserScript(response)

  if (response.body) {
    const $ = cheerio.load(response.body)
    // console.log("Transform script running on '"+response.req.originalUrl+"'") // for testing

    // Those 2 scripts are added using server side transformation just for Proof of Concept purposes.
    // For production those 2 scripts should be included in original website base code.
    $('head').append(`
      <script src="/__layer0__/cache-manifest.js" defer="defer"></script>
      <script src="/main.js" defer="defer"></script>
    `)

    $('head').append(`
      <style>
        .l0-hidden {
          display: none;
        }
      </style>
    `)

    // Relativise links
    $('a[href^="https://www.monrovia.com"]').map((i, el) => {
      var link = $(el).attr('href') || '';
      $(el).attr('href', link.replace('https://www.monrovia.com/', '/'));
    })

    // Fixing CORS image issues by proxing images to Layer0 server
    $('a[style]').map((i, el) => {
      var style = $(el).attr('style') || '';
      var relativizedStyle = style.replace('https://www.monrovia.com', '');
      var arrayURL = relativizedStyle.match(/background-image:.url\(([^\)]+)/) || '';
      var url = arrayURL[1]

      $(el).attr('style', relativizedStyle)
      $(el).append(`<img class="l0-img l0-hidden" src="${url}" />`)
    })

    $('img[src^="https://www.monrovia.com"]').map((i, el) => {
      var url = $(el).attr('src') || '';
      var newUrl = url.replace('https://www.monrovia.com/', '/')
      $(el).attr('src', newUrl)
    })

    $('#category-banner-image').map((i, el) => {
      var style = $('style:contains("mgz-parallax-inner")');
      var bannerRaw = style.html() || '';

      var relativizedStyle = bannerRaw.replace(/https:\/\/www.monrovia.com/g, '');

      var bannerObject = relativizedStyle.match(/mgz-parallax-inner{background-image:url\('([^']+)/) || '';
      var url = bannerObject[1]

      $('body').prepend(`<img class="l0-banner l0-hidden" src="${url}" />`)
      style.html(relativizedStyle)

    })

    $('link[rel="stylesheet"]').map((i, el) => {
      var url = $(el).attr('href') || '';
      var newUrl = url.replace('https://www.monrovia.com/', '/')
      $(el).attr('href', newUrl)
    })

    $('script[src^="https://www.monrovia.com"]').map((i, el) => {
      var url = $(el).attr('src') || '';
      var newUrl = url.replace('https://www.monrovia.com/', '/')
      $(el).attr('src', newUrl)
    })

    response.body = $.html()

    // https://demos-monrovia-default.layer0.link/media/catalog/product/cache/75c7456819fd9a6ec6a3543519c190b6/r/e/rest_2_9_2959.jpeg

  }
}
