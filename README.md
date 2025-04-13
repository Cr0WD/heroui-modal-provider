# HeroUI-modal-provider

[![package version](https://img.shields.io/npm/v/heroui-modal-provider.svg?style=flat-square)](https://www.npmjs.com/package/heroui-modal-provider)
[![package downloads](https://img.shields.io/npm/dm/heroui-modal-provider.svg?style=flat-square)](https://www.npmjs.com/package/heroui-modal-provider)
[![package license](https://img.shields.io/npm/l/heroui-modal-provider.svg?style=flat-square)](https://www.npmjs.com/package/heroui-modal-provider)


A fork of [`mui-modal-provider`](https://www.npmjs.com/package/mui-modal-provider) — but adapted for **HeroUI-compatible modals** (e.g. from [`@heroui/react`](https://www.npmjs.com/package/@heroui/react),[`@heroui/modal`](https://www.npmjs.com/package/@heroui/modal)) and modern UI frameworks.

HeroUI-modal-provider is a helper based on [Context API](https://en.reactjs.org/docs/context.html) and [React Hooks](https://en.reactjs.org/docs/hooks-intro.html) for simplified work with modals (dialogs) built on [HeroUI](https://www.heroui.com/) or custom solutions with suitable props.

> Huge thanks to the original `mui-modal-provider` maintainers for the clean architecture and API inspiration.  
> This fork brings full support for `<Modal />` from HeroUI and async control.


---

## 📦 Installation

```bash
npm install heroui-modal-provider
# or
yarn add heroui-modal-provider
```

---

## 🚀 Quick Start

```tsx
import { ModalProvider, useModal } from "heroui-modal-provider";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@heroui/react";

const MyModal = ({ isOpen, onClose }) => (
  <Modal isOpen={isOpen} onClose={onClose}>
    <ModalContent>
      {(close) => (
        <>
          <ModalHeader>My Modal</ModalHeader>
          <ModalBody>This modal is controlled via modal-provider.</ModalBody>
          <ModalFooter>
            <Button color="primary" onPress={close}>Close</Button>
          </ModalFooter>
        </>
      )}
    </ModalContent>
  </Modal>
);

function App() {
  const { showModal } = useModal();

  return (
    <Button onPress={() => showModal(MyModal)}>
      Open Modal
    </Button>
  );
}

// in root
<ModalProvider>
  <App />
</ModalProvider>
```

---

## 💡 Access Modals Anywhere with `getModal()`

Want to show modals from outside component? Use `getModal()`:

```tsx
import { getModal } from "heroui-modal-provider";
import MyModal from "./MyModal";

// Wrap your App first
<ModalProvider>
	<App/>
</ModalProvider>

const showModal = ()=>{
	getModal()?.showModal(MyModal, { title: "Hello" });
}
```


---

## 💡 If You’re Using Next.js
### Show Modals Anywhere (with Dynamic Import)

Want to open a modal outside the React tree in Next.js? Use `getModal()` with dynamic import:

```tsx
import dynamic from "next/dynamic";
import { getModal } from "heroui-modal-provider";

const showModal = async () => {
    // Dynamically import the modal with SSR disabled
    const MyModal = await import("./MyModal").then((mod) => mod.default);
    getModal()?.showModal(MyModal, { title: "Hello" });
};

// Wrap your app with <ModalProvider> in _app.tsx
<ModalProvider>
    <Component {...pageProps} />
</ModalProvider>

```

Internally, this uses a **modal-nexus** registry that syncs the current modal context. Once `<ModalProvider>` is mounted, `getModal()` exposes:

- `showModal(Component, props?, options?)`
- `hideModal(id)`
- `destroyModal(id)`
- `updateModal(id, nextProps)`

Returned modal instances also include:

```ts
const modal = showModal(...);

modal.hide();
modal.destroy();
```

---

## 🧩 Modal Options

All modal-related methods accept optional `options`:

| Option           | Type      | Description                            |
|------------------|-----------|----------------------------------------|
| `rootId`         | `string`  | Group modals under a root context      |
| `hideOnClose`    | `boolean` | Hide modal when `onClose` is triggered |
| `destroyOnClose` | `boolean` | Destroy modal after closing            |

---

## 🔧 Advanced Usage

- Use `updateModal(id, props)` to patch a modal
- Use `destroyModalsByRootId(rootId)` to batch remove grouped modals
- Use `disableAutoDestroy: true` in `useModal()` to persist modals manually

---

Made by [**Cr0WD**](https://github.com/cr0wd)
