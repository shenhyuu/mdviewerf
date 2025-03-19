import { createRouter, createWebHistory } from 'vue-router';
import DocumentViewer from '../views/DocumentViewer.vue';
import ContentsView from '../views/ContentsView.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'contents',
      component: ContentsView
    },
    {
      path: '/documents/:uuid',
      name: 'document',
      component: DocumentViewer
    }
  ]
});

export default router; 