import { createRouter, createWebHistory } from 'vue-router';
import CardGroupList from '../pages/CardGroupList.vue';
import CardGroupDetail from '../pages/CardGroupDetail.vue';
import CarpoolList from '../pages/CarpoolList.vue';
import CarpoolDetail from '../pages/CarpoolDetail.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/card-groups',
    },
    {
      path: '/card-groups',
      name: 'CardGroupList',
      component: CardGroupList,
    },
    {
      path: '/card-groups/:id',
      name: 'CardGroupDetail',
      component: CardGroupDetail,
      props: true,
    },
    {
      path: '/card-groups/:id/carpools',
      name: 'CarpoolList',
      component: CarpoolList,
      props: true,
    },
    {
      path: '/carpools/:id',
      name: 'CarpoolDetail',
      component: CarpoolDetail,
      props: true,
    },
  ],
});

export default router;
