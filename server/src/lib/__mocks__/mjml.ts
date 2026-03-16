interface MjmlResult {
  html: string;
  errors: { message: string }[];
}

function mjml2html(_mjmlContent: string): MjmlResult {
  return {
    html: '<html><body>Mocked MJML output</body></html>',
    errors: [],
  };
}

export default mjml2html;
