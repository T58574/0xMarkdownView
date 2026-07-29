declare module 'markdown-it-task-lists' {
  import MarkdownIt from 'markdown-it';
  const plugin: MarkdownIt.PluginSimple | MarkdownIt.PluginWithOptions<any>;
  export default plugin;
}

declare module 'markdown-it-container' {
  import MarkdownIt from 'markdown-it';
  const plugin: MarkdownIt.PluginWithOptions<any>;
  export default plugin;
}

declare module 'markdown-it-anchor' {
  import MarkdownIt from 'markdown-it';
  const plugin: MarkdownIt.PluginWithOptions<any> & {
    permalink: any;
  };
  export default plugin;
}
