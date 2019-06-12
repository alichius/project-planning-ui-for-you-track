export interface BundleElement {
  id: string;
  name: string;
  ordinal: number;
}

export interface CustomField {
  id: string;
  fieldDefaults: CustomFieldDefaults;
  fieldType: {
    id: string;
  };
  name: string;
}

// tslint:disable-next-line:no-empty-interface
export interface CustomFieldDefaults {}

// tslint:disable-next-line:no-empty-interface
export interface EnumBundleElement extends BundleElement {}

export interface EnumBundleCustomFieldDefaults extends CustomFieldDefaults {
  bundle: {
    values: EnumBundleElement[];
  };
}

export interface IssueLinkType {
  directed: boolean;
  id: string;
  name: string;
  sourceToTarget: string;
  targetToSource: string;
}

export interface SavedQuery {
  id: string;
  name: string;
  owner: {
    fullName: string;
  };
}

export interface StateBundleElement extends BundleElement {
  isResolved: boolean;
}

export interface User {
  avatarUrl: string;
  fullName: string;
  id: string;
}

export interface StateBundleCustomFieldDefaults extends CustomFieldDefaults {
  bundle: {
    values: StateBundleElement[];
  };
}
