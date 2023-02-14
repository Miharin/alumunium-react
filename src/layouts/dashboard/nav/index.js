import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
// @mui
import { styled, alpha } from '@mui/material/styles';
import {
  Box,
  Link,
  Drawer,
  Typography,
  Avatar,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
} from '@mui/material';
// mock
import account from '_mock/account';
// hooks
import useResponsive from 'hooks/useResponsive';
// components
import Logo from 'components/logo';
import Scrollbar from 'components/scrollbar';
import NavSection from 'components/nav-section';
import { EqualizerRounded, ExpandLess, ExpandMore, StarBorder } from '@mui/icons-material';
import { useSidebarConfig } from 'store/index';
//
import navConfig from './config';
// ----------------------------------------------------------------------

const NAV_WIDTH = 280;

const StyledAccount = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(2, 2.5),
  borderRadius: Number(theme.shape.borderRadius) * 1.5,
  backgroundColor: alpha(theme.palette.grey[500], 0.12),
}));

// ----------------------------------------------------------------------

Nav.propTypes = {
  openNav: PropTypes.bool,
  onCloseNav: PropTypes.func,
};

const itemNav = [
  {
    name: 'Dashboard',
    icon: '',
    links: '/dashboard',
    isExpand: false,
    open: 'openDashboard',
    toggle: 'toggleDashboard',
  },
  {
    name: 'Users',
    icon: '',
    isExpand: true,
    open: 'openUsers',
    toggle: 'toggleUsers',
    Expand: [
      {
        name: 'List Users',
        icon: '',
        links: '',
      },
      {
        name: 'Create Users',
        icon: '',
        links: '',
      },
    ],
  },
  {
    name: 'Product',
    icon: '',
    isExpand: true,
    open: 'openProduct',
    toggle: 'toggleProduct',
    Expand: [
      {
        name: 'List Holo',
        icon: '',
        links: '',
      },
    ],
  },
];

export default function Nav({ openNav, onCloseNav }) {
  const { pathname } = useLocation();
  const openDashboard = useSidebarConfig((state) => state.openDashboard);
  const toggleDashboard = useSidebarConfig((state) => state.toggleDashboard);
  console.log(itemNav.length, itemNav[1].Expand.length);
  const isDesktop = useResponsive('up', 'lg');
  const ItemNavigateSidebar = () => {
    for (let itemNavigation = 0; itemNavigation < itemNav.length; itemNavigation++) {
      return (
        <List sx={{ pl: 1 }}>
          <ListItemButton onClick={toggleDashboard}>
            <ListItemIcon sx={{ minWidth: '0px', mr: 2 }}>
              <EqualizerRounded />
            </ListItemIcon>
            <ListItemText
              primaryTypographyProps={{ fontSize: '0.9em', fontWeight: openDashboard ? 'medium' : 'small' }}
              primary="Dashboard"
            />
            {openDashboard ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
          <Collapse in={openDashboard} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItemButton sx={{ pl: 4 }}>
                <ListItemIcon>
                  <StarBorder />
                </ListItemIcon>
                <ListItemText primaryTypographyProps={{ fontSize: '0.9em' }} primary="Starred" />
              </ListItemButton>
            </List>
          </Collapse>
        </List>
      );
    }
  };

  const renderContent = (
    <Scrollbar
      sx={{
        height: 1,
        '& .simplebar-content': { height: 1, display: 'flex', flexDirection: 'column' },
      }}
    >
      <Box sx={{ px: 2.5, py: 3, display: 'inline-flex' }}>
        <Logo />
      </Box>

      <Box sx={{ mb: 5, mx: 2.5 }}>
        <Link underline="none">
          <StyledAccount>
            <Avatar src={account.photoURL} alt="photoURL" />

            <Box sx={{ ml: 2 }}>
              <Typography variant="subtitle2" sx={{ color: 'text.primary' }}>
                {account.displayName}
              </Typography>

              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {account.role}
              </Typography>
            </Box>
          </StyledAccount>
        </Link>
      </Box>

      <NavSection data={navConfig} onClick={onCloseNav} />
      <ItemNavigateSidebar />
    </Scrollbar>
  );

  return (
    <Box
      component="nav"
      sx={{
        flexShrink: { lg: 0 },
        // width: { lg: NAV_WIDTH },
      }}
    >
      {isDesktop ? (
        <Drawer
          open={openNav}
          onClose={onCloseNav}
          ModalProps={{
            keepMounted: true,
          }}
          PaperProps={{
            sx: {
              width: NAV_WIDTH,
            },
          }}
        >
          {renderContent}
        </Drawer>
      ) : (
        <Drawer
          open={openNav}
          onClose={onCloseNav}
          ModalProps={{
            keepMounted: true,
          }}
          PaperProps={{
            sx: { width: NAV_WIDTH },
          }}
        >
          {renderContent}
        </Drawer>
      )}
    </Box>
  );
}
