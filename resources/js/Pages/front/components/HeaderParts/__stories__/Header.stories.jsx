import React from 'react';
import Header from '../HeaderNew';

export default {
  title: 'Components/Header',
  component: Header,
};

const Template = (args) => <Header {...args} />;

export const Desktop = Template.bind({});
Desktop.args = {};

export const Mobile = Template.bind({});
Mobile.parameters = {
  viewport: { defaultViewport: 'mobile1' },
};

export { default } from './HeaderNew';