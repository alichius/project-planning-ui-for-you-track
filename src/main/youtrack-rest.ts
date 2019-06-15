export interface BundleElement {
  $type: string;
  color: {
    $type: 'FieldStyle';
    background: string;
    foreground: string;
  };
  id: string;
  name: string;
  ordinal: number;
}

export interface CustomField {
  $type: 'FieldType';
  id: string;
  fieldDefaults: CustomFieldDefaults;
  fieldType: {
    $type: 'FieldType';
    id: string;
  };
  name: string;
}

export interface CustomFieldDefaults {
 /**
  * Type name.
  *
  * Even though this interface has derived interfaces, the YouTrack REST API does return this base type, too -- for
  * instance if the field type is 'date' or 'period'.
  */
  $type: string;
}

export interface EnumBundleElement extends BundleElement {
  $type: 'EnumBundleElement';
}

export interface EnumBundleCustomFieldDefaults extends CustomFieldDefaults {
  $type: 'EnumBundleCustomFieldDefaults';
  bundle: {
    $type: 'EnumBundle';
    values: EnumBundleElement[];
  };
}

export interface IssueLinkType {
  $type: 'IssueLinkType';
  directed: boolean;
  id: string;
  name: string;
  sourceToTarget: string;
  targetToSource: string;
}

export interface SavedQuery {
  $type: 'SavedQuery';
  id: string;
  name: string;
  owner: {
    $type: 'User';
    fullName: string;
  };
}

export interface StateBundleElement extends BundleElement {
  $type: 'StateBundleElement';
  isResolved: boolean;
}

export interface User {
  $type: 'User';
  avatarUrl: string;
  fullName: string;
  id: string;
}

export interface StateBundleCustomFieldDefaults extends CustomFieldDefaults {
  $type: 'StateBundleCustomFieldDefaults';
  bundle: {
    $type: 'StateBundle';
    values: StateBundleElement[];
  };
}
