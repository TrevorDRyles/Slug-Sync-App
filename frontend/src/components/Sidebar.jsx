/*
Sidebar/Navbar component
Built upon starter framework from mantine documentation
https://ui.mantine.dev/category/navbars/
*/

//NOTE FOR CHANGING LINKS IN FUTURE: Ctrl+f "/login" to find all link stubs

import { useState } from 'react';
import { Center, Tooltip, UnstyledButton, Stack, rem } from '@mantine/core';
import { IconHome2, IconGauge, IconDeviceDesktopAnalytics, IconFingerprint, IconCalendarStats, IconUser, IconSettings, IconLogout, IconSwitchHorizontal, } from '@tabler/icons-react';
import { MantineLogo } from '@mantinex/mantine-logo';
import classes from './Sidebar.module.css';
import PropTypes from "prop-types";
import { Collapse } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { LoginContext } from '../contexts/Login';
import * as React from 'react'

function NavbarLink({ icon: Icon, label, active, onClick, aria }) {
  return (<Tooltip label={label} position="right" transitionProps={{ duration: 0 }}>
    <UnstyledButton onClick={onClick} className={classes.link} data-active={active || undefined}>
      <Icon style={{ width: rem(20), height: rem(20) }} stroke={1.5} aria-label={aria}/>
    </UnstyledButton>
  </Tooltip>);
}

export default function Sidebar() {
  const [active, setActive] = useState(0);
  const navigate = useNavigate();
  const {user} = React.useContext(LoginContext);

  const sidebarItems = [
    { icon: IconHome2, label: 'Home', route: '/', aria: 'HomeIcon1' },
    { icon: IconUser, label: 'Profile', route: `/profile/${user.id}`, aria: 'UserIcon1' },
    // { icon: IconSettings, label: 'Settings', route: '/login', aria: 'SettingsIcon1'},
  ];


  const links = sidebarItems.map((link, index) => (
    <NavbarLink {...link}
                key={link.label}
                active={index === active}
      onClick={() => {
        navigate(link.route)
        setActive(index)
      }}
    />
  ));
  return (
    // <Collapse in={true}>
      <nav className={classes.navbar}>
        <div className={classes.navbarMain}>
          <Stack justify="center" gap={0}>
            {links}
          </Stack>
        </div>

        <Stack justify="center" gap={0}>
          <NavbarLink aria={'LogoutIcon'} icon={IconLogout} label="Logout" />
        </Stack>
      </nav>
    // </Collapse>
  );
}
NavbarLink.propTypes = {
  icon: PropTypes.elementType.isRequired,
  label: PropTypes.string.isRequired,
  active: PropTypes.bool,
  onClick: PropTypes.func,
  aria: PropTypes.string,
};

Sidebar.propTypes = {
  sidebarOpened: PropTypes.bool.isRequired,
};
