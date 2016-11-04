---
title: Structure of Draft.js source code
permalink: draftjs-src
date: 2016-04-10
---

# Structure of Draft.js souce code

`Draft.js` is a framework for building rich editors in React, developed by facebook.

Our products also has a rich editor, it is basically a wrapper around `contentEditable` and `executeCommand`. I don't work on the editor, but I have had a look at the code sometime ago. I'm not a fan of the approach we took because we do *NOT* have full control over the generated html. I always think an abstraction layer should be used to isolate data model and view. This is the approach `Draft.js` takes.

I follow the [docs](https://facebook.github.io/draft-js/docs/overview.html#content) when reading the souce code.

## Basics

For a basic editor you will need to use `Editor` component and `EditorState` record.

- `Editor`: src/component/base defines the component, it's a simple React component with a lot of(I think) props. See `DraftEditorProps.js` in base folder. `Editor` does not store editor state inside, so you *must* provide an `onChange` callback to save the state somewhere and trigger a render.
- `EditorState`: src/model/immutable. It is an immutable `Record` under the hood that represents the entire state of a Draft editor. To quote from the doc:
	- The current text content state
	- The current selection state
	- The fully decorated representation of the contents
	- Undo/redo stacks
	- The most recent type of change made to the contents

	For an explanation of the fields, see the [doc](https://facebook.github.io/draft-js/docs/api-reference-editor-state.html#forceselection). To encapsulate the implementation details, users do not have direct access to the immutable record instance. Users should only use the static/instance methods on `EditorState` to manipulate state.

`currentContent` represents the current state of the entire contents and selection states(both before and after rendering this `ContentState`) of the editor. The undo/redo stacks are collections of `ContentState`. For the list of method available on `ContentState`, see the [doc](https://facebook.github.io/draft-js/docs/api-reference-content-state.html#content). You can think of `ContentState` as an ordered map of blocks(`ContentBlock`) with keys.

`ContentBlock` is largely analogous to block-level HTML elements. They are the building blocks of editor content as its name suggests. Under the hood, it is a list of `CharaterMetadata`.

`CharacterMetadata` reprensents a character and its styles(both inline styles and entity information). Pooling is used to ensure memory footprint stay relatively small. Note, inline styles are ordered sets, not css styles, e.g.

`OrderedSet.of('BOLD', 'ITALIC', 'UNDERLINE')`

So far, we can see the conceptual model of `Draft` editor is a list of blocks(implemented as an ordered map), and each block is a list of characters with styles.

Next is `SelectionState`, it represents the selection range in the editor. There are two terms used in the record, anchor is the start of the selection and focus is the end of the selection just as the [DOM selection API](https://developer.mozilla.org/en-US/docs/Web/API/Selection#Glossary). This notation has a concept of direction. `SelectionState` also exports the two point that is irrelavent of direction as you sometimes don't care direction. See the [api doc](https://facebook.github.io/draft-js/docs/api-reference-selection-state.html#content) for more details.

## Entities and Decorators

`Entity` is used to decorate text ranges with metadta. Entities are referenced by names which is a string. For an introduction of entities, [read the doc](https://facebook.github.io/draft-js/docs/advanced-topics-entities.html).

The source code for entities is in: src/model/entity.

An entity has three fields:

- type
- mutability: this name is really confusing IMHO, read the doc to get an idea of what it means. Anyway, it is used to indicate how the annotated text may be mutated.
	immutable | mutable | segmented
- data: metadata for the entity

`Decorator` to customize rendering of a range of texts. Read the [doc](https://facebook.github.io/draft-js/docs/advanced-topics-decorators.html#content) to get idea of decorators.

The source code is here: src/model/decorators.

src/component/contents contains React components that is used to render blocks. Each `DraftEditorBlock` has an array of `DraftEditorLeaf` or decorator components. `DraftEditorTextNode` is the lowest level component, it renders text nodes.

## Custom Block Components

You can use `blockRendererFn` props on `Editor` to customize block rendering. Read these<sup>[1](https://facebook.github.io/draft-js/docs/advanced-topics-block-components.html#content), [2](https://github.com/facebook/draft-js/issues/246)</sup>.

## Handlers

src/component/handlers implements three kinds of handlers for different modes. `composition` mode is used when typing using IME, `drag` handles drag events and `edit` handles editing events.

## Encodings

src/model/encoding implements convertion from `ContentState` to raw js object and vice versa. There's also a processor for converting html string into `ContentBlock`s. The HTML processor does not support all valid html tags and styles, tags and styles will be lost if they are unsupported.

## Utils
src/model/modifier implements a large number of utilities to manipulate `EditorState` and `ContentState`. Read the docs<sup>[1](https://facebook.github.io/draft-js/docs/api-reference-rich-utils.html#content), [2](https://facebook.github.io/draft-js/docs/api-reference-modifier.html#content)</sup> for more details.

## Conclusion

The design of Draft.js is simple and clean. The code should be easy to follow after you get an idea on the building blocks. This project is still young, seems Facebook developed it to mainly fit their needs. Let's see how it will evolve.
