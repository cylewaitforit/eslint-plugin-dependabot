/**
 * Type definitions for YAML utilities.
 * These types are used for runtime type checking when processing YAML AST nodes.
 */

import type { Document, Node, Pair } from "yaml";

/**
 * Union of all possible YAML node types that can be visited.
 * Used for runtime type narrowing when processing YAML AST.
 */
export type NodeLike = Document | Node | Pair;
