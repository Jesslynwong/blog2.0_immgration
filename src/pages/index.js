/*
 * @Author: Jesslynwong jesslynwjx@gmail.com
 * @Date: 2022-12-04 15:36:57
 * @LastEditors: Jesslynwong jesslynwjx@gmail.com
 * @LastEditTime: 2022-12-14 10:37:34
 * @FilePath: /blog2.0_immgration/blog/src/pages/index.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Hero from '../../static/img/Hero.jpg'
import HomepageFeatures from '@site/src/components/HomepageFeatures';

import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <h1 className="hero__title">{siteConfig.title}</h1>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/intro">
            Docusaurus Tutorial - 5min ⏱️
          </Link>
        </div>
      </div>
    </header>
  );
}
const svgList = [
  {
    title: 'github',
    Svg: require('../../static/img/github.svg').default,
    color: 'black',
    link: 'https://github.com/Jesslynwong',
  },
  // {
  //   title: 'bilibili',
  //   Svg: require('../../static/img/bilibili.svg').default,
  //   link: 'https://space.bilibili.com/223211771',
  // },
  {
    title: 'csdn',
    Svg: require('../../static/img/csdn.svg').default,
    color: '#2979ff',
    link: 'https://blog.csdn.net/m0_50233720?type=blog',
  },
]
const Svg = ({ Svg, color, title, link }) => {
  return (
    <a href={link} target='_blank'>
      <Svg className={styles.svg} style={{ fill: color }} />
    </a>
  )
}

function Introduction() {
  return (
    <div className={styles.myHeroContainer}>
      <div className={styles.leftContainer}>
        <h1 className={styles.leftContainer_h1}>
          Hello<br/>Welcome to <br/>Jesslyn's World
        </h1>
        <p className={styles.leftContainer_p}>
          一个热爱探索，好奇心重的程序媛👧
          <br />
          在这里记录知识，希望对你也有帮助 🏖️
        </p>
        <div className={styles.buttonContainer}>
          <div className={styles.svgContainer}>
            {svgList.map((item, index) => {
              return <Svg {...item} key={item.title} />
            })}
          </div>
        </div>
      </div>
      <div className={styles.rightContainer}>
        <img src={Hero} alt='HeroImg' />
      </div>
    </div>
  )
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`Hello from ${siteConfig.title}`}
      description="Description will go into a meta tag in <head />">
      {/* <HomepageHeader /> */}
      <main>
        {/* <HomepageFeatures /> */}
        <Introduction/>
      </main>
    </Layout>
  );
}
