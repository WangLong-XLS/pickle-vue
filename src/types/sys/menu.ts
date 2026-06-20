/** 菜单项类型（对应后端 SysMenu 实体） */
export interface SysMenu {
  menuUuid?: string;
  menuName: string;
  menuPath?: string;
  menuIcon?: string;
  parentUuid?: string;
  menuOrder?: string;
  menuType: string; // 0=菜单项，1=子菜单分组
  visible?: string; // Y/N
  component?: string;
  roleUuidIn?: string | string[];
}

/** 动态菜单渲染用的树形结构 */
export interface MenuItem {
  menuUuid: string;
  menuName: string;
  menuPath?: string;
  menuIcon?: string;
  menuType: string;
  sysMenuIn?: MenuItem[];
}
