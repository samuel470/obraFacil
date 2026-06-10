package com.obrafacil.domain.model;

import java.util.List;

public class ProgressPolicy {
  public static int stageProgress(int total, int done) { return total == 0 ? 0 : (int)Math.round((done*100.0)/total); }
  public static int projectProgress(List<Integer> stages) { return stages.isEmpty()?0:(int)Math.round(stages.stream().mapToInt(Integer::intValue).average().orElse(0)); }
}
