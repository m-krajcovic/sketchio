import { SketchingPage } from './app.po';

describe('sketching App', () => {
  let page: SketchingPage;

  beforeEach(() => {
    page = new SketchingPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
