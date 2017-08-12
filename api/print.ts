import * as wkhtmltopdf from 'wkhtmltopdf';
import { render } from 'mustache';
import { S3 } from 'aws-sdk';
import { readFileSync, createWriteStream, unlinkSync } from 'fs';
const s3 = new S3();

const tmpFileLocation = '/tmp/rendered.pdf';
wkhtmltopdf.command = './wkhtmltopdf';


export async function receipt(event, context, callback) {
  const data = event.body;
  if (!data || !data.hasOwnProperty('id')) {
    return callback('[400] Body must have an id.');
  }

  let resp = await getTemplate('receipt.html');
  await generatePdf(render(resp.Body.toString('utf8'), data));
  let blob = readFileSync(tmpFileLocation);

  s3.putObject({
    Bucket: process.env.PDF_BUCKET as string,
    Key: data.id,
    Body: blob,
    ContentType: 'application/pdf',
    ACL: 'public-read-write',
    Metadata: { "x-amz-meta-requestId": context.awsRequestId }
  }).promise()
      .then(() => {
          unlinkSync(tmpFileLocation);
          callback(null, { id: data.id });
      })
      .catch((err)=> {
          unlinkSync(tmpFileLocation);
          if (err) {
              console.log(err);
              return callback(err.statusCode ? `[${err.statusCode}] ${err.message}` : '[500] Server error. Please try later');
          }})
}

function getTemplate(templateName): Promise<any> {
  return s3.getObject({
    Bucket: process.env.BUCKET as string,
    Key: templateName,
  }).promise();
}

function generatePdf(rendered): Promise<any> {
  return new Promise((ok, notOk) => {
    wkhtmltopdf(rendered, {
      encoding: 'utf-8',
      pageSize: 'a4',
      'header-html': '',
      'footer-html': '',
      'margin-top': 15,
      'margin-bottom': 15,
      'margin-left': 15,
      'margin-right': 15,
      dpi: 300,
      'image-quality': 100,
      // 'user-style-sheet': styleSheet,
    }, (err) => err ? notOk(err) : ok())
      .pipe(createWriteStream(tmpFileLocation));
  });
}