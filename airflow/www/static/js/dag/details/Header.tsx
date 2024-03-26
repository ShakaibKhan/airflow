/*!
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React, { useEffect } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Text,
} from "@chakra-ui/react";

import { getDagRunLabel, getMetaValue, getTask } from "src/utils";
import useSelection from "src/dag/useSelection";
import Time from "src/components/Time";
import { useGridData, useTaskInstance } from "src/api";
import RunTypeIcon from "src/components/RunTypeIcon";

import BreadcrumbText from "./BreadcrumbText";

const dagId = getMetaValue("dag_id");

const Header = () => {
  const {
    data: { dagRuns, groups, ordering },
  } = useGridData();

  const {
    selected: { taskId, runId, mapIndex },
    onSelect,
    clearSelection,
  } = useSelection();

  const { data: taskInstance } = useTaskInstance({
    dagId,
    dagRunId: runId || "",
    taskId: taskId || "",
    mapIndex,
    enabled: mapIndex !== undefined,
  });

  const dagRun = dagRuns.find((r) => r.runId === runId);

  const group = getTask({ taskId, task: groups });

  // If runId and/or taskId can't be found remove the selection
  useEffect(() => {
    if (runId && !dagRun && taskId && !group) {
      clearSelection();
    } else if (runId && !dagRun) {
      onSelect({ taskId });
    }
  }, [dagRun, taskId, group, runId, onSelect, clearSelection]);

  let runLabel;
  if (dagRun && runId) {
    // If a runId includes the runtype then parse the time, otherwise use the custom run id
    const runName =
      runId.includes("manual__") ||
      runId.includes("scheduled__") ||
      runId.includes("backfill__") ||
      runId.includes("dataset_triggered__") ? (
        <Time dateTime={getDagRunLabel({ dagRun, ordering })} />
      ) : (
        runId
      );
    runLabel = (
      <>
        <RunTypeIcon runType={dagRun.runType} />
        {runName}
      </>
    );
  }

  const lastIndex = taskId ? taskId.lastIndexOf(".") : null;
  const taskName =
    taskId && lastIndex ? taskId.substring(lastIndex + 1) : taskId;

  const isDagDetails = !runId && !taskId;
  const isRunDetails = !!(runId && !taskId);
  const isTaskDetails = !runId && taskId;
  const isMappedTaskDetails = runId && taskId && mapIndex !== undefined;

  return (
    <Breadcrumb ml={3} pt={2} separator={<Text color="gray.300">/</Text>}>
      <BreadcrumbItem isCurrentPage={isDagDetails} mt={4}>
        <BreadcrumbLink
          onClick={clearSelection}
          _hover={isDagDetails ? { cursor: "default" } : undefined}
        >
          <BreadcrumbText label="DAG" value={dagId} />
        </BreadcrumbLink>
      </BreadcrumbItem>
      {runId && (
        <BreadcrumbItem isCurrentPage={isRunDetails} mt={4}>
          <BreadcrumbLink
            onClick={() => onSelect({ runId })}
            _hover={isRunDetails ? { cursor: "default" } : undefined}
          >
            <BreadcrumbText label="Run" value={runLabel} />
          </BreadcrumbLink>
        </BreadcrumbItem>
      )}
      {taskId && (
        <BreadcrumbItem isCurrentPage mt={4}>
          <BreadcrumbLink
            onClick={() =>
              mapIndex !== undefined
                ? onSelect({ runId, taskId })
                : onSelect({ taskId })
            }
            _hover={isTaskDetails ? { cursor: "default" } : undefined}
          >
            <BreadcrumbText
              label="Task"
              value={`${taskName}${group?.isMapped ? " []" : ""}`}
            />
          </BreadcrumbLink>
        </BreadcrumbItem>
      )}
      {mapIndex !== undefined && (
        <BreadcrumbItem isCurrentPage mt={4}>
          <BreadcrumbLink
            _hover={isMappedTaskDetails ? { cursor: "default" } : undefined}
          >
            <BreadcrumbText
              label="Map Index"
              value={taskInstance?.renderedMapIndex || mapIndex}
            />
          </BreadcrumbLink>
        </BreadcrumbItem>
      )}
    </Breadcrumb>
  );
};

export default Header;
